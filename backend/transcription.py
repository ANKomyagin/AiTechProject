import torch
import whisperx
import gc
from whisperx.diarize import DiarizationPipeline


def transcribe_and_diarize(audio_path, hf_token="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"):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"--- [Transcription] Starting on {device} ---")

    try:
        # 1. Загрузка Whisper
        print("1. Loading Whisper model...")
        model = whisperx.load_model("medium", device=device, compute_type="float16")

        # 2. Транскрибация
        print("2. Transcribing...")
        result = model.transcribe(audio_path, batch_size=8)

        # Очистка Whisper (он больше не нужен для выравнивания, но нужен язык)
        language = result["language"]
        del model
        gc.collect()
        torch.cuda.empty_cache()

        # 3. Выравнивание (Alignment)
        print("3. Aligning...")
        align_model, metadata = whisperx.load_align_model(language_code=language, device=device)
        result_aligned = whisperx.align(result["segments"], align_model, metadata, audio_path, device,
                                        return_char_alignments=False)

        # Очистка Alignment
        del align_model
        del metadata
        gc.collect()
        torch.cuda.empty_cache()

        # 4. Диаризация
        print("4. Diarizing...")
        diarize_model = DiarizationPipeline(use_auth_token=hf_token, device=device)
        diarize_segments = diarize_model(audio_path)

        result_with_speakers = whisperx.assign_word_speakers(diarize_segments, result_aligned)

        # Очистка Diarization
        del diarize_model
        gc.collect()
        torch.cuda.empty_cache()

        # Форматирование результата
        performance_info = []
        for seg in result_with_speakers["segments"]:
            part = [
                seg.get('speaker', 'Unknown'),
                seg['text'].strip(),
                round(seg["start"], 2),
                round(seg["end"], 2)
            ]
            performance_info.append(part)

        print("--- [Transcription] Finished & Memory Cleaned ---")
        return performance_info

    except Exception as e:
        print(f"Error in transcription: {e}")
        # Аварийная очистка
        gc.collect()
        torch.cuda.empty_cache()
        raise e
