import torch
import librosa
import numpy as np
import gc
from transformers import Wav2Vec2FeatureExtractor, WavLMModel


# Определение модели MLP (класс остается глобальным, так как он легкий, но веса грузим локально)
class MLP(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.net = torch.nn.Sequential(
            torch.nn.Linear(29952, 2048),
            torch.nn.BatchNorm1d(2048), torch.nn.ReLU(), torch.nn.Dropout(0.4),
            torch.nn.Linear(2048, 1024),
            torch.nn.BatchNorm1d(1024), torch.nn.ReLU(), torch.nn.Dropout(0.3),
            torch.nn.Linear(1024, 256),
            torch.nn.BatchNorm1d(256), torch.nn.ReLU(), torch.nn.Dropout(0.2),
            torch.nn.Linear(256, 4)
        )

    def forward(self, x):
        return self.net(x)


EMOTION_LABELS = ['sad', 'angry', 'neutral', 'positive']


def analyze_emotions(performance_info, audio_path):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"--- [Emotion] Starting on {device} ---")

    # Переменные для моделей
    processor = None
    wavlm = None
    mlp = None

    try:
        print("1. Loading Emotion Models...")
        processor = Wav2Vec2FeatureExtractor.from_pretrained("microsoft/wavlm-base-plus")
        wavlm = WavLMModel.from_pretrained("microsoft/wavlm-base-plus").to(device).eval()

        mlp = MLP().to(device)
        # Путь к весам - проверьте, что файл существует!
        mlp.load_state_dict(torch.load("models/best_model.pth", map_location=device))
        mlp.eval()

        print("2. Processing segments...")
        result = []

        # Вспомогательная функция внутри, чтобы иметь доступ к загруженным моделям
        def get_embedding(audio_tensor):
            with torch.no_grad():
                x = audio_tensor.squeeze(0).cpu().numpy()
                inputs = processor(x, sampling_rate=16000, return_tensors="pt")
                input_vals = inputs.input_values.to(device)
                out = wavlm(input_vals, output_hidden_states=True)
                hidden = torch.cat(out.hidden_states, dim=-1).squeeze(0)
                mean = hidden.mean(dim=0)
                max_, _ = hidden.max(dim=0)
                std = hidden.std(dim=0)
                return torch.cat([mean, max_, std])

        for i, item in enumerate(performance_info):
            speaker, text, start, end = item
            duration = end - start

            try:
                # Загружаем кусочек
                if duration <= 0: raise ValueError("Zero duration")
                y, _ = librosa.load(audio_path, sr=16000, mono=True, offset=start, duration=duration)
                waveform = torch.tensor(y).unsqueeze(0)

                # Инференс
                emb = get_embedding(waveform.to(device))
                with torch.no_grad():
                    logits = mlp(emb.unsqueeze(0))
                    probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()
                    idx = int(np.argmax(probs))

                emotion = EMOTION_LABELS[idx]
                score = float(probs[idx])

            except Exception as e:
                # Fallback если аудио слишком короткое или битое
                emotion = 'neutral'
                score = 0.5

            result.append([speaker, text, start, end, emotion, score])

        return result

    except Exception as e:
        print(f"Error in emotion analysis: {e}")
        raise e

    finally:
        # 3. Гарантированная очистка памяти
        print("3. Cleaning Emotion Models memory...")
        del wavlm
        del mlp
        del processor
        gc.collect()
        torch.cuda.empty_cache()
        print("--- [Emotion] Finished & Cleaned ---")

