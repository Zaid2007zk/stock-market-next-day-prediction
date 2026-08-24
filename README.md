# Stock Market Next-Day Prediction

## Project Overview

This project uses machine learning to predict the next-day movement of stock prices based on historical market data.

The main objective is to classify whether a stock is likely to move significantly upward on the next trading day.

## Target Definition

The target was created using the next-day return.

A day was classified as:

- `1` → Next-day return > 0.25%
- `0` → Next-day return <= 0.25%

## Dataset

The dataset contains historical stock market data from 2016 to 2026.

The data was organized year-wise and processed before model development.

## Feature Engineering

Several technical features were created, including:

- Daily Return
- Moving Average
- Price vs Moving Average
- High-Low Range
- Volume Ratio
- Rolling Volatility
- Lagged Returns
- Return Momentum
- Rolling Returns

## Machine Learning

Different experiments were performed using Random Forest based approaches.

The experiments included:

- Original Random Forest
- K-Means + Random Forest
- 0.25% Target Experiment
- Balanced Random Forest
- Momentum-based Features

## Final Evaluation

The final model was evaluated on an unseen 2025 test period.

### Final Test Results

| Metric | Score |
|---|---:|
| Accuracy | 42.35% |
| ROC-AUC | 0.5215 |

The results show that predicting short-term stock movements is a difficult problem and the current model has limited predictive power.

## Project Structure

```text
NIFTY-50-Stock-Market-Data-main/
│
├── data/
│   ├── 2016.csv
│   ├── 2017.csv
│   ├── ...
│   └── 2026.csv
│
├── Stock_market.ipynb
├── README.md
└── .gitignores