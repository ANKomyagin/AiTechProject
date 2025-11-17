"""
Проверяет корректность работы модуля транскрибации, диаризации
"""

import torch
import whisperx
import json
import os

# 1. Проверка GPU
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"✅ PyTorch device: {device}")
if device == "cuda":
    gpu_name = torch.cuda.get_device_name(0)
    vram = torch.cuda.get_device_properties(0).total_memory / 1024**3
    print(f"🚀 GPU: {gpu_name} ({vram:.1f} GB VRAM)")
else:
    print("⚠️ GPU не найден. Транскрибация будет выполняться на CPU (медленно).")

# 2. Указываем путь к аудиофайлу (можно .m4a, .mp3, .wav и т.д.)
audio_path = "audio.m4a"

# Проверяем наличие файла
if not os.path.exists(audio_path):
    raise FileNotFoundError(f"Файл не найден: {audio_path}")

# 3. Загружаем модель WhisperX
model = whisperx.load_model("medium", device=device)

# 4. Транскрибация
print("🎧 Начинаю транскрибацию...")
result = model.transcribe(audio_path)

# 5. Объединяем текст в одну строку
text = "\n".join([seg["text"].strip() for seg in result["segments"] if seg["text"].strip()])

# 6. Сохраняем в txt
output_path = "transcript.txt"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(text)

print(f"✅ Транскрибация завершена. Результат сохранён в {output_path}")

# 7. (необязательно) Вывод первых строк в консоль
print("\n📝 Первые строки результата:")
print("\n".join(text.splitlines()[:10]))
