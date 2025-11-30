import os
import shutil
import subprocess
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from transcription import transcribe_and_diarize
from emotions import analyze_emotions
from llm_service import generate_ai_report

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp"
os.makedirs(TEMP_DIR, exist_ok=True)


def convert_and_trim_audio(input_path, output_path, start, end):
    """FFmpeg wrapper"""
    command = [
        "ffmpeg", "-i", input_path, "-ss", str(start)
    ]
    if end > start:
        command.extend(["-to", str(end)])

    command.extend([
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        "-y", output_path
    ])


    try:
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"FFmpeg failed: {e.stderr.decode('utf-8', errors='ignore')}")


@app.post("/analyze")
async def analyze_audio(
        file: UploadFile = File(...),
        start: float = Form(0.0),
        end: float = Form(0.0)
):
    # 1. Генерируем безопасное имя файла (UUID)
    # Это решает проблему с кириллицей, пробелами и спецсимволами
    file_ext = os.path.splitext(file.filename)[1]
    if not file_ext: file_ext = ".tmp"

    unique_id = str(uuid.uuid4())
    original_filename_safe = f"{unique_id}_orig{file_ext}"
    processed_filename_safe = f"{unique_id}_proc.wav"

    original_path = os.path.join(TEMP_DIR, original_filename_safe)
    processed_path = os.path.join(TEMP_DIR, processed_filename_safe)

    try:
        # 2. Сохраняем входящий файл
        with open(original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Request: {file.filename} -> saved as {original_filename_safe}")
        print(f"Trimming: {start}s - {end}s")

        convert_and_trim_audio(original_path, processed_path, start, end)

        perf_info = transcribe_and_diarize(processed_path)

        full_data = analyze_emotions(perf_info, processed_path)

        # 6. Подготовка данных для ответа и LLM
        full_transcript = ""
        emotion_data_for_frontend = []

        for item in full_data:
            speaker, text, seg_start, seg_end, emotion, score = item
            full_transcript += f"{speaker}: {text}\n"
            mid_point = (seg_start + seg_end) / 2
            emotion_data_for_frontend.append({
                "time": mid_point,
                "emotion": emotion,
                "score": score
            })

        # 7. LLM Pipeline (Ollama Load -> Run -> Unload logic inside Ollama)
        emotion_list_detailed = [{"emotion": item["emotion"], "score": item["score"]} for item in
                                 emotion_data_for_frontend]

        ai_report = generate_ai_report(full_transcript, emotion_list_detailed)

        # 8. Финальный ответ
        return {
            "transcript": full_transcript,
            "emotionData": emotion_data_for_frontend,
            "report": ai_report
        }

    except Exception as e:
        print(f"CRITICAL ERROR in handler: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if os.path.exists(original_path): os.remove(original_path)
            if os.path.exists(processed_path): os.remove(processed_path)
        except Exception:
            pass


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)