import streamlit as st
import pandas as pd
import numpy as np
import joblib
import yfinance as yf
import plotly.graph_objects as go
from pathlib import Path
from datetime import timedelta


# ============================================================
# MARKETPULSE
# Live market data + next-day prediction
# ============================================================

st.set_page_config(
    page_title="MarketPulse",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="collapsed"
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "final_stock_model_50trees.joblib"


# ============================================================
# STOCK LIST
# Quick-select list. User can also enter ANY NSE ticker.
# ============================================================

NIFTY_50 = {
    "ADANIENT": "ADANIENT.NS",
    "ADANIPORTS": "ADANIPORTS.NS",
    "APOLLOHOSP": "APOLLOHOSP.NS",
    "ASIANPAINT": "ASIANPAINT.NS",
    "AXISBANK": "AXISBANK.NS",
    "BAJAJ-AUTO": "BAJAJ-AUTO.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "BAJAJFINSV": "BAJAJFINSV.NS",
    "BEL": "BEL.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "CIPLA": "CIPLA.NS",
    "COALINDIA": "COALINDIA.NS",
    "DRREDDY": "DRREDDY.NS",
    "EICHERMOT": "EICHERMOT.NS",
    "ETERNAL": "ETERNAL.NS",
    "GRASIM": "GRASIM.NS",
    "HCLTECH": "HCLTECH.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "HDFCLIFE": "HDFCLIFE.NS",
    "HEROMOTOCO": "HEROMOTOCO.NS",
    "HINDALCO": "HINDALCO.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "INDUSINDBK": "INDUSINDBK.NS",
    "INFY": "INFY.NS",
    "ITC": "ITC.NS",
    "JIOFIN": "JIOFIN.NS",
    "JSWSTEEL": "JSWSTEEL.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
    "LT": "LT.NS",
    "M&M": "M&M.NS",
    "MARUTI": "MARUTI.NS",
    "MAXHEALTH": "MAXHEALTH.NS",
    "NESTLEIND": "NESTLEIND.NS",
    "NTPC": "NTPC.NS",
    "ONGC": "ONGC.NS",
    "POWERGRID": "POWERGRID.NS",
    "RELIANCE": "RELIANCE.NS",
    "SBILIFE": "SBILIFE.NS",
    "SBIN": "SBIN.NS",
    "SHRIRAMFIN": "SHRIRAMFIN.NS",
    "SUNPHARMA": "SUNPHARMA.NS",
    "TATACONSUM": "TATACONSUM.NS",
    "TATASTEEL": "TATASTEEL.NS",
    "TCS": "TCS.NS",
    "TECHM": "TECHM.NS",
    "TITAN": "TITAN.NS",
    "TRENT": "TRENT.NS",
    "ULTRACEMCO": "ULTRACEMCO.NS",
    "WIPRO": "WIPRO.NS"
}


# ============================================================
# UI
# ============================================================

st.markdown(
    """
    <style>
    .stApp {
        background:
            radial-gradient(
                circle at 85% 0%,
                rgba(14, 165, 233, 0.10),
                transparent 30%
            ),
            #070B12;
    }

    .block-container {
        max-width: 1180px;
        padding-top: 28px;
        padding-bottom: 50px;
    }

    #MainMenu {
        visibility: hidden;
    }

    footer {
        visibility: hidden;
    }

    h1 {
        font-size: 58px !important;
        font-weight: 800 !important;
        letter-spacing: -2px !important;
        margin-bottom: 0 !important;
    }

    h2 {
        font-weight: 700 !important;
    }

    h3 {
        font-weight: 650 !important;
    }

    [data-testid="stMetric"] {
        background: rgba(13, 20, 32, 0.65);
        border: 1px solid #1E3047;
        border-radius: 14px;
        padding: 18px 20px;
    }

    [data-testid="stMetricLabel"] {
        color: #8FA3BA !important;
    }

    [data-testid="stMetricValue"] {
        color: #F8FAFC !important;
        font-weight: 700 !important;
    }

    div[data-baseweb="select"] > div {
        background: #0D1420;
        border: 1px solid #26364D;
        border-radius: 10px;
    }

    .stButton > button {
        width: 100%;
        height: 54px;
        border-radius: 12px;
        background: linear-gradient(
            135deg,
            #0EA5E9,
            #2563EB
        );
        color: white;
        border: 1px solid #38BDF8;
        font-size: 15px;
        font-weight: 750;
        letter-spacing: 0.5px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ============================================================
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_model():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            "final_stock_model_50trees.joblib was not found."
        )

    return joblib.load(MODEL_PATH)


# ============================================================
# DOWNLOAD LIVE DATA
# ============================================================

@st.cache_data(ttl=900)
def download_stock_data(ticker):

    data = yf.download(
        ticker,
        period="1y",
        interval="1d",
        auto_adjust=False,
        progress=False
    )

    if data.empty:

        raise ValueError(
            f"No market data was returned for {ticker}."
        )

    # yfinance can return MultiIndex columns.
    if isinstance(data.columns, pd.MultiIndex):

        data.columns = data.columns.get_level_values(0)

    data = data.reset_index()

    # Rename columns to the names used by the model.
    data = data.rename(
        columns={
            "Date": "timestamp",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume"
        }
    )

    required = [
        "timestamp",
        "high",
        "low",
        "close",
        "volume"
    ]

    missing = [
        column
        for column in required
        if column not in data.columns
    ]

    if missing:

        raise ValueError(
            f"Missing columns from market data: {missing}"
        )

    data = data[
        required
    ].copy()

    data["timestamp"] = pd.to_datetime(
        data["timestamp"],
        errors="coerce"
    )

    data = data.dropna(
        subset=[
            "timestamp",
            "close",
            "high",
            "low",
            "volume"
        ]
    )

    data = data.sort_values(
        "timestamp"
    )

    data = data.drop_duplicates(
        "timestamp"
    )

    return data.reset_index(
        drop=True
    )


# ============================================================
# FEATURE ENGINEERING
# EXACT SAME SIX FEATURES USED BY THE MODEL
# ============================================================

def build_features(data):

    data = data.copy()

    data["daily_return"] = (
        data["close"]
        .pct_change()
        * 100
    )

    data["ma_10"] = (
        data["close"]
        .rolling(10)
        .mean()
    )

    data["volatility_10"] = (
        data["daily_return"]
        .rolling(10)
        .std()
    )

    data["avg_volume_10"] = (
        data["volume"]
        .rolling(10)
        .mean()
    )

    data["volume_ratio"] = (
        data["volume"]
        /
        data["avg_volume_10"]
    )

    data["price_vs_ma10"] = (
        (
            data["close"]
            -
            data["ma_10"]
        )
        /
        data["ma_10"]
    ) * 100

    data["high_low_range"] = (
        (
            data["high"]
            -
            data["low"]
        )
        /
        data["close"]
    ) * 100

    return data


# ============================================================
# NEXT WEEKDAY
# ============================================================

def next_weekday(date_value):

    next_date = date_value + timedelta(days=1)

    while next_date.weekday() >= 5:

        next_date += timedelta(days=1)

    return next_date


# ============================================================
# LOAD MODEL
# ============================================================

try:

    model = load_model()

except Exception as error:

    st.error(
        f"Model loading error: {error}"
    )

    st.stop()


# ============================================================
# HEADER
# ============================================================

st.title("MarketPulse")

st.caption(
    "NEXT-DAY STOCK MOVEMENT INTELLIGENCE"
)

st.write("")


# ============================================================
# MARKET SCANNER
# ============================================================

st.subheader("Market Scanner")


scanner1, scanner2, scanner3 = st.columns(
    [2.3, 0.7, 1.0]
)


with scanner1:

    selected_name = st.selectbox(
        "Select Stock",
        sorted(NIFTY_50.keys())
    )


with scanner2:

    st.metric(
        "Quick Stocks",
        len(NIFTY_50)
    )


with scanner3:

    st.metric(
        "Data",
        "LIVE"
    )


# ============================================================
# CUSTOM STOCK OPTION
# ============================================================

with st.expander(
    "Want another stock? Enter NSE ticker"
):

    custom_symbol = st.text_input(
        "NSE ticker",
        placeholder="Example: IRCTC"
    ).strip().upper()

    st.caption(
        "Example: IRCTC → IRCTC.NS"
    )


if custom_symbol:

    display_symbol = custom_symbol

    ticker = (
        custom_symbol
        if custom_symbol.endswith(".NS")
        else custom_symbol + ".NS"
    )

else:

    display_symbol = selected_name

    ticker = NIFTY_50[selected_name]


# ============================================================
# DOWNLOAD CURRENT MARKET DATA
# ============================================================

with st.spinner(
    f"Fetching latest market data for {display_symbol}..."
):

    try:

        raw_data = download_stock_data(
            ticker
        )

    except Exception as error:

        st.error(
            f"Could not fetch {display_symbol}: {error}"
        )

        st.stop()


# ============================================================
# BUILD FEATURES
# ============================================================

market_data = build_features(
    raw_data
)


required_features = [
    "daily_return",
    "ma_10",
    "volatility_10",
    "volume_ratio",
    "price_vs_ma10",
    "high_low_range"
]


stock_data = market_data.dropna(
    subset=required_features
).copy()


if stock_data.empty:

    st.error(
        "Not enough historical data to calculate the model features."
    )

    st.stop()


# ============================================================
# LATEST AVAILABLE TRADING DAY
# ============================================================

latest = stock_data.iloc[-1]

latest_date = pd.Timestamp(
    latest["timestamp"]
)

next_prediction_date = next_weekday(
    latest_date.date()
)


# ============================================================
# DATA THROUGH
# ============================================================

st.metric(
    "Data Through",
    latest_date.strftime("%d %b %Y")
)

st.caption(
    f"Latest completed market session. "
    f"Prediction target: {next_prediction_date.strftime('%d %b %Y')}."
)


# ============================================================
# MARKET SNAPSHOT
# ============================================================

st.write("")

st.subheader(
    f"Market Snapshot — {display_symbol}"
)


snapshot1, snapshot2, snapshot3, snapshot4 = st.columns(
    4
)


with snapshot1:

    st.metric(
        "Last Close",
        f"{latest['close']:,.2f}"
    )


with snapshot2:

    st.metric(
        "Daily Return",
        f"{latest['daily_return']:.2f}%"
    )


with snapshot3:

    st.metric(
        "MA10",
        f"{latest['ma_10']:,.2f}"
    )


with snapshot4:

    st.metric(
        "Volume Ratio",
        f"{latest['volume_ratio']:.2f}x"
    )


# ============================================================
# 3D FEATURE SPACE
# ============================================================

st.write("")

st.subheader(
    "3D Market Feature Space"
)

st.caption(
    "Recent observations across Daily Return, MA10 and Volatility."
)


graph_data = stock_data.tail(40).copy()


fig = go.Figure()


fig.add_trace(
    go.Scatter3d(

        x=graph_data["daily_return"],

        y=graph_data["ma_10"],

        z=graph_data["volatility_10"],

        mode="markers",

        marker=dict(
            size=5,
            color="#38BDF8",
            opacity=0.65
        ),

        customdata=graph_data[
            ["timestamp"]
        ],

        hovertemplate=(
            "<b>%{customdata[0]}</b><br>"
            "Daily Return: %{x:.2f}%<br>"
            "MA10: %{y:,.2f}<br>"
            "Volatility: %{z:.2f}%"
            "<extra></extra>"
        ),

        showlegend=False
    )
)


fig.add_trace(
    go.Scatter3d(

        x=[latest["daily_return"]],

        y=[latest["ma_10"]],

        z=[latest["volatility_10"]],

        mode="markers+text",

        text=["CURRENT"],

        textposition="top center",

        marker=dict(
            size=12,
            color="#F59E0B",
            symbol="diamond",
            line=dict(
                color="#FFFFFF",
                width=2
            )
        ),

        showlegend=False
    )
)


fig.update_layout(

    height=520,

    margin=dict(
        l=0,
        r=0,
        t=10,
        b=0
    ),

    paper_bgcolor="rgba(0,0,0,0)",

    font=dict(
        color="#CBD5E1"
    ),

    scene=dict(

        bgcolor="rgba(0,0,0,0)",

        xaxis=dict(
            title="Daily Return (%)",
            gridcolor="#24364D",
            zerolinecolor="#3B5068"
        ),

        yaxis=dict(
            title="MA10",
            gridcolor="#24364D",
            zerolinecolor="#3B5068"
        ),

        zaxis=dict(
            title="Volatility (%)",
            gridcolor="#24364D",
            zerolinecolor="#3B5068"
        ),

        camera=dict(
            eye=dict(
                x=1.45,
                y=1.45,
                z=1.15
            )
        )
    )
)


st.plotly_chart(
    fig,
    use_container_width=True,
    config={
        "displayModeBar": False,
        "displaylogo": False,
        "responsive": True
    }
)


# ============================================================
# CALCULATED FEATURES
# ============================================================

with st.expander(
    "View calculated market features"
):

    feature_table = pd.DataFrame(
        {
            "Feature": [
                "Daily Return",
                "MA10",
                "10-Day Volatility",
                "Volume Ratio",
                "Price vs MA10",
                "High-Low Range"
            ],

            "Value": [
                latest["daily_return"],
                latest["ma_10"],
                latest["volatility_10"],
                latest["volume_ratio"],
                latest["price_vs_ma10"],
                latest["high_low_range"]
            ]
        }
    )

    st.dataframe(
        feature_table,
        hide_index=True,
        use_container_width=True
    )


# ============================================================
# PREDICTION
# ============================================================

st.write("")

run_prediction = st.button(
    "RUN NEXT-DAY ANALYSIS",
    use_container_width=True
)


if run_prediction:

    model_input = pd.DataFrame(
        [[
            latest["daily_return"],
            latest["ma_10"],
            latest["volatility_10"],
            latest["volume_ratio"],
            latest["price_vs_ma10"],
            latest["high_low_range"]
        ]],

        columns=[
            "daily_return",
            "ma_10",
            "volatility_10",
            "volume_ratio",
            "price_vs_ma10",
            "high_low_range"
        ]
    )


    # Get model probabilities.
    probabilities = model.predict_proba(
        model_input
    )[0]


    # Get the class labels stored by the model.
    classes = list(
        model.classes_
    )


    # Find probability for class 1 (UP).
    if 1 in classes:

        probability_up = float(
            probabilities[
                classes.index(1)
            ]
        )

    else:

        probability_up = 0.0


    # DOWN probability.
    probability_down = (
        1.0
        -
        probability_up
    )


    # Final model decision.
    prediction = int(
        model.predict(
            model_input
        )[0]
    )


    if prediction == 1:

        signal = "UP"

        confidence = probability_up

    else:

        signal = "DOWN"

        confidence = probability_down


    # ========================================================
    # MODEL OUTPUT
    # ========================================================

    st.write("")

    st.subheader(
        "Model Output"
    )


    if signal == "UP":

        st.success(
            f"NEXT-DAY SIGNAL: UP\n\n"
            f"Prediction target: "
            f"{next_prediction_date.strftime('%d %b %Y')}\n\n"
            f"Model confidence: "
            f"{confidence * 100:.2f}%"
        )

    else:

        st.error(
            f"NEXT-DAY SIGNAL: DOWN\n\n"
            f"Prediction target: "
            f"{next_prediction_date.strftime('%d %b %Y')}\n\n"
            f"Model confidence: "
            f"{confidence * 100:.2f}%"
        )


    # ========================================================
    # PROBABILITY
    # ========================================================

    st.write("")

    st.subheader(
        "Prediction Probability"
    )


    probability1, probability2 = st.columns(
        2
    )


    with probability1:

        st.metric(
            "UP Probability",
            f"{probability_up * 100:.2f}%"
        )

        st.progress(
            probability_up
        )


    with probability2:

        st.metric(
            "DOWN Probability",
            f"{probability_down * 100:.2f}%"
        )

        st.progress(
            probability_down
        )


    # ========================================================
    # IMPORTANT MODEL NOTE
    # ========================================================

    if hasattr(
        model,
        "n_estimators"
    ):

        tree_count = int(
            model.n_estimators
        )

        st.caption(
            f"Probability comes directly from the "
            f"{tree_count}-tree Random Forest. "
            f"With {tree_count} trees, probability steps "
            f"can be about {100 / tree_count:.1f} percentage points."
        )


    # ========================================================
    # SIMPLE INTERPRETATION
    # ========================================================

    if signal == "UP":

        st.info(
            f"The model gives a higher probability of "
            f"an upward next-day movement "
            f"({probability_up * 100:.2f}% vs "
            f"{probability_down * 100:.2f}%)."
        )

    else:

        st.warning(
            f"The model gives a higher probability of "
            f"a downward next-day movement "
            f"({probability_down * 100:.2f}% vs "
            f"{probability_up * 100:.2f}%)."
        )


# ============================================================
# FOOTER
# ============================================================

st.write("")

st.divider()

st.caption(
    "MarketPulse • Machine Learning Project • "
    "Educational / research use only • "
    "Not financial advice"
)
