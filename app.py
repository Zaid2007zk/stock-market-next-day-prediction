import streamlit as st
import pandas as pd
import numpy as np
import joblib
import plotly.graph_objects as go
from pathlib import Path


# ============================================================
# MARKETPULSE
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

DATA_DIR = BASE_DIR / "data"

MODEL_PATH = BASE_DIR / "final_stock_model_50trees.joblib"


# ============================================================
# PROFESSIONAL DARK UI
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

    div[data-baseweb="select"] > div:hover {
        border-color: #38BDF8;
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
        box-shadow:
            0 8px 25px rgba(14, 165, 233, 0.18);
    }

    .stButton > button:hover {
        border-color: #7DD3FC;
        box-shadow:
            0 12px 32px rgba(14, 165, 233, 0.28);
    }

    [data-testid="stExpander"] {
        border: 1px solid #24344A;
        border-radius: 12px;
        background: rgba(9, 15, 25, 0.55);
    }

    hr {
        border-color: #1B2A3D !important;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ============================================================
# LOAD MARKET DATA
# ============================================================

@st.cache_data
def load_market_data():

    csv_files = sorted(
        DATA_DIR.glob("*.csv")
    )

    if not csv_files:
        raise FileNotFoundError(
            "No CSV files found inside the data folder."
        )

    frames = []

    for file in csv_files:

        frames.append(
            pd.read_csv(file)
        )

    data = pd.concat(
        frames,
        ignore_index=True
    )

    if "Unnamed: 0" in data.columns:

        data = data.drop(
            columns=["Unnamed: 0"]
        )

    data["timestamp"] = pd.to_datetime(
        data["timestamp"],
        errors="coerce"
    )

    data = data.dropna(
        subset=[
            "timestamp",
            "symbol"
        ]
    )

    data = data.sort_values(
        [
            "symbol",
            "timestamp"
        ]
    )

    data = data.reset_index(
        drop=True
    )

    return data


# ============================================================
# FEATURE ENGINEERING
# ============================================================

@st.cache_data
def build_features(data):

    data = data.copy()

    data["daily_return"] = (
        data.groupby("symbol")["close"]
        .pct_change()
        * 100
    )

    data["ma_10"] = (
        data.groupby("symbol")["close"]
        .transform(
            lambda x:
            x.rolling(10).mean()
        )
    )

    data["volatility_10"] = (
        data.groupby("symbol")["daily_return"]
        .transform(
            lambda x:
            x.rolling(10).std()
        )
    )

    data["avg_volume_10"] = (
        data.groupby("symbol")["volume"]
        .transform(
            lambda x:
            x.rolling(10).mean()
        )
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
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_model():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            "final_stock_model_50trees.joblib "
            "was not found beside marketpulse.py."
        )

    return joblib.load(
        MODEL_PATH
    )


# ============================================================
# INITIALIZE
# ============================================================

try:

    market_data = load_market_data()

    market_data = build_features(
        market_data
    )

    model = load_model()

except Exception as error:

    st.error(
        f"Application error: {error}"
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


symbols = sorted(
    market_data["symbol"]
    .dropna()
    .unique()
    .tolist()
)


scanner1, scanner2, scanner3 = st.columns(
    [2.3, 0.7, 1.0]
)


with scanner1:

    selected_symbol = st.selectbox(
        "Select Stock",
        symbols,
        index=0
    )


with scanner2:

    st.metric(
        "Stocks",
        len(symbols)
    )


with scanner3:

    latest_global_date = (
        market_data["timestamp"].max()
    )

    st.metric(
        "Data Through",
        latest_global_date.strftime(
            "%d %b %Y"
        )
    )


# ============================================================
# SELECT STOCK
# ============================================================

stock_data = market_data[
    market_data["symbol"]
    ==
    selected_symbol
].copy()


# ============================================================
# REMOVE INVALID FEATURE ROWS
# ============================================================

required_features = [
    "daily_return",
    "ma_10",
    "volatility_10",
    "volume_ratio",
    "price_vs_ma10",
    "high_low_range"
]


stock_data = stock_data.dropna(
    subset=required_features
)


if stock_data.empty:

    st.warning(
        "Not enough historical data for this stock."
    )

    st.stop()


# ============================================================
# LATEST DATA
# ============================================================

latest = stock_data.iloc[-1]


# ============================================================
# MARKET SNAPSHOT
# ============================================================

st.write("")

st.subheader("Market Snapshot")


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


st.caption(
    f"Latest available market data for "
    f"{selected_symbol}: "
    f"{latest['timestamp'].strftime('%d %B %Y')}"
)


# ============================================================
# 3D MARKET FEATURE SPACE
# ============================================================

st.write("")

st.subheader(
    "3D Market Feature Space"
)

st.caption(
    "Recent market observations across Daily Return, "
    "MA10 and Volatility."
)


# ------------------------------------------------------------
# Use only recent observations.
# No connecting lines.
# No labels on every point.
# ------------------------------------------------------------

graph_data = stock_data.tail(40).copy()


# ============================================================
# 3D SCATTER
# ============================================================

fig = go.Figure()


# ------------------------------------------------------------
# Historical points.
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# Current stock position.
# ------------------------------------------------------------

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

        hovertemplate=(
            "<b>CURRENT</b><br>"
            "Daily Return: "
            f"{latest['daily_return']:.2f}%"
            "<br>"
            "MA10: "
            f"{latest['ma_10']:,.2f}"
            "<br>"
            "Volatility: "
            f"{latest['volatility_10']:.2f}%"
            "<extra></extra>"
        ),

        showlegend=False
    )
)


# ============================================================
# GRAPH LAYOUT
# ============================================================

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
            zerolinecolor="#3B5068",
            showbackground=False
        ),

        yaxis=dict(
            title="MA10",
            gridcolor="#24364D",
            zerolinecolor="#3B5068",
            showbackground=False
        ),

        zaxis=dict(
            title="Volatility (%)",
            gridcolor="#24364D",
            zerolinecolor="#3B5068",
            showbackground=False
        ),

        camera=dict(
            eye=dict(
                x=1.45,
                y=1.45,
                z=1.15
            )
        ),

        aspectmode="auto"
    )
)


# ============================================================
# DISPLAY GRAPH
# ============================================================

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
# RUN MARKET ANALYSIS
# ============================================================

st.write("")

run_prediction = st.button(
    "RUN MARKET ANALYSIS",
    use_container_width=True
)


# ============================================================
# MODEL PREDICTION
# ============================================================

if run_prediction:

    # --------------------------------------------------------
    # Exact six features used by the trained model.
    # --------------------------------------------------------

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


    # --------------------------------------------------------
    # Get UP probability.
    # --------------------------------------------------------

    probability_up = float(
        model.predict_proba(
            model_input
        )[0, 1]
    )


    # --------------------------------------------------------
    # DOWN probability.
    # --------------------------------------------------------

    probability_down = (
        1.0
        -
        probability_up
    )


    # --------------------------------------------------------
    # Decision.
    #
    # 50% means the larger probability wins.
    # Example:
    # UP   = 44%
    # DOWN = 56%
    # Final signal = DOWN
    # --------------------------------------------------------

    prediction = int(
        probability_up >= 0.50
    )


    # ========================================================
    # SIGNAL
    # ========================================================

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


    # ========================================================
    # CLEAN NATIVE STREAMLIT RESULT
    # ========================================================

    if signal == "UP":

        st.success(
            f"NEXT-DAY SIGNAL: UP\n\n"
            f"Confidence: {confidence * 100:.2f}%"
        )

    else:

        st.error(
            f"NEXT-DAY SIGNAL: DOWN\n\n"
            f"Confidence: {confidence * 100:.2f}%"
        )


    # ========================================================
    # CONFIDENCE
    # ========================================================

    st.write("")

    st.metric(
        "Model Confidence",
        f"{confidence * 100:.2f}%"
    )

    st.progress(
        float(confidence)
    )


    # ========================================================
    # PREDICTION PROBABILITY
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
            float(probability_up)
        )


    with probability2:

        st.metric(
            "DOWN Probability",
            f"{probability_down * 100:.2f}%"
        )

        st.progress(
            float(probability_down)
        )


    # ========================================================
    # SIMPLE INTERPRETATION
    # ========================================================

    if signal == "UP":

        st.info(
            f"The model indicates a higher probability "
            f"of an upward next-day movement "
            f"({probability_up * 100:.2f}% vs "
            f"{probability_down * 100:.2f}%)."
        )

    else:

        st.warning(
            f"The model indicates a higher probability "
            f"of a downward next-day movement "
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