const Config={

    mazeSize:10,

    showShortestPath:true,

    canvasSize:700,

    wallWidth:4,

    playerRadius:30,

    playerNameFontSize:20,

    playerEmojiFontSize:34,

    fps:30,

    thinkingMin:500,

    thinkingMax:1000,

    speedMin:2,

    speedMax:5,

    noRevisit:false,

    trailLength:40,

    bounceHeight:10,

    wiggle:2,

    colors:[

        "#FF5252",
        "#42A5F5",
        "#66BB6A",
        "#AB47BC",
        "#FFA726",
        "#26C6DA",
        "#EC407A",
        "#D4E157",
        "#8D6E63",
        "#5C6BC0",
        "#26A69A",
        "#EF5350"

    ],

    faceEmojis:[

        "😀",
        "😄",
        "😁",
        "😆",
        "🙂",
        "😊",
        "😉",
        "😎",
        "🤩",
        "🥳",
        "😇",
        "🤠",
        "😺",
        "😸",
        "😹",
        "😻",
        "🤓",
        "🫠",
        "😋",
        "😌",
        "😜",
        "🤗",
        "🫡",
        "🫢",
        "🫣",
        "😏",
        "🥸",
        "🤖",
        "👽",
        "🐵"

    ]

};

Config.cellSize=Config.canvasSize/Config.mazeSize;