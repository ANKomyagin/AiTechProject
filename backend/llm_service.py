import json
import ollama
from pydantic import BaseModel, Field
from typing import List


class AnalysisReport(BaseModel):
    emotionalBackground: str = Field(description="Общее описание эмоционального фона речи.")
    speechQuality: str = Field(description="Качество речи: 'Отлично', 'Хорошо', 'Удовлетворительно', 'Плохо'.")
    engagement: str = Field(description="Вовлеченность: 'Высокий', 'Умеренный', 'Низкий'.")
    emotionalVariance: str = Field(description="Разнообразие эмоций: 'Динамичный', 'Умеренный', 'Монотонный'.")
    structure: str = Field(description="Оценка структуры и ясности.")
    overallScore: int = Field(description="Оценка от 0 до 100.")
    keyStrengths: List[str] = Field(description="2-3 сильные стороны.")
    areasForImprovement: List[str] = Field(description="2-3 области для улучшения.")


def generate_ai_report(transcript: str, emotion_data: list) -> dict:
    """
    Генерирует отчет локально через Ollama с фокусом на эмоциональный анализ.
    """

    # 1. Детальный анализ эмоциональных паттернов
    if emotion_data:
        emotion_counts = {}
        emotion_timeline = []
        emotion_scores = {}

        for item in emotion_data:
            emo = item['emotion']
            score = item.get('score', 0.5)
            emotion_counts[emo] = emotion_counts.get(emo, 0) + 1
            emotion_timeline.append((emo, score))

            if emo not in emotion_scores:
                emotion_scores[emo] = []
            emotion_scores[emo].append(score)

        total = len(emotion_data)
        emotion_summary = ", ".join([f"{k}: {round(v / total * 100)}%" for k, v in emotion_counts.items()])

        # Анализ интенсивности эмоций
        intensity_analysis = ""
        for emo, scores in emotion_scores.items():
            avg_intensity = sum(scores) / len(scores)
            intensity_analysis += f"{emo}: {avg_intensity:.2f}, "

        # Анализ эмоциональных переходов
        transitions = []
        for i in range(1, len(emotion_timeline)):
            prev_emo, prev_score = emotion_timeline[i - 1]
            curr_emo, curr_score = emotion_timeline[i]
            if prev_emo != curr_emo:
                transitions.append(f"{prev_emo}→{curr_emo}")

        transition_analysis = ""
        if transitions:
            unique_transitions = list(set(transitions))
            transition_analysis = "Переходы: " + ", ".join(unique_transitions[:5])

        emotion_detailed_analysis = f"""
ЭМОЦИОНАЛЬНОЕ РАСПРЕДЕЛЕНИЕ: {emotion_summary}
ИНТЕНСИВНОСТЬ ЭМОЦИЙ: {intensity_analysis}
ЭМОЦИОНАЛЬНАЯ ДИНАМИКА: {len(transitions)} переходов. {transition_analysis}
        """
    else:
        emotion_detailed_analysis = "Нет данных об эмоциях."
        emotion_summary = "Нет данных."

    # 2. Формируем промпт с фокусом на эмоции
    system_prompt = """Ты профессиональный тренер по ораторскому искусству с экспертизой в эмоциональном анализе речи.
    Проанализируй текст и ДЕТАЛЬНЫЕ данные об эмоциях. Сделай акцент на эмоциональной составляющей выступления.
    Ответь ТОЛЬКО валидным JSON объектом.
    Не пиши никаких вступлений типа "Вот ваш отчет". Только JSON. Ответ дай на русском"""

    user_prompt = f"""
ТРАНСКРИПЦИЯ:
"{transcript[:35000]}"

ДЕТАЛЬНЫЙ АНАЛИЗ ЭМОЦИЙ:
{emotion_detailed_analysis}

ПРОЦЕНТНОЕ РАСПРЕДЕЛЕНИЕ ЭМОЦИЙ:
{emotion_summary}

ПРОАНАЛИЗИРУЙ:
1. Эмоциональный фон: какие эмоции преобладают и как они влияют на восприятие речи
2. Качество речи: как эмоции влияют на ясность и убедительность
3. Вовлеченность: насколько эмоциональная подача вовлекает аудиторию
4. Эмоциональная вариативность: динамика смены эмоций
5. Структура: как эмоции поддерживают или мешают структуре выступления
6. Общая оценка: интегральная оценка с учетом эмоционального интеллекта
7. Сильные стороны: эмоциональные моменты, которые усиливают речь
8. Зоны роста: что можно улучшить в эмоциональной подаче

Заполни следующую JSON структуру данными на основе ЭМОЦИОНАЛЬНОГО АНАЛИЗА:
{{
    "emotionalBackground": "строка (детальный анализ преобладающих эмоций и их влияния)",
    "speechQuality": "Отлично/Хорошо/Удовлетворительно/Плохо (оценка с учетом эмоциональной выразительности)",
    "engagement": "Высокий/Умеренный/Низкий (на основе эмоционального воздействия)",
    "emotionalVariance": "Динамичный/Умеренный/Монотонный (анализ смены эмоций)",
    "structure": "строка (как эмоции поддерживают структурное построение речи)",
    "overallScore": число 0-100 (с весомым учетом эмоционального компонента)",
    "keyStrengths": ["сила1 (эмоциональная)", "сила2 (эмоциональная)"],
    "areasForImprovement": ["совет1 по эмоциональной подаче", "совет2 по эмоциональной подаче"]
}}
"""

    print("Sending request to local Ollama (qwen2.5:3b)...")

    try:
        response = ollama.chat(model='qwen2.5:3b', messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ], format='json', keep_alive=0)

        json_str = response['message']['content']

        data_dict = json.loads(json_str)
        report = AnalysisReport(**data_dict)

        return report.model_dump()

    except Exception as e:
        print(f"Local LLM Error: {e}")
        return _get_stub_report()


def _get_stub_report():
    return {
        "emotionalBackground": "Ошибка локальной нейросети.",
        "speechQuality": "Удовлетворительно",
        "engagement": "Низкий",
        "emotionalVariance": "Умеренный",
        "structure": "Не удалось сгенерировать.",
        "overallScore": 0,
        "keyStrengths": ["Локальный запуск"],
        "areasForImprovement": ["Убедитесь, что Ollama запущена"]
    }
