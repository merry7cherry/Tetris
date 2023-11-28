
function arenaSweep() {//清除满格的行，更新分数
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function collide(arena, player) {//检测是否碰撞
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {//创建画布数组
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {//创建俄罗斯方块
    if (type === 'T') {
        return [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [5, 5, 5, 5],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw() {//画边框及当前俄罗斯方块和方块主体
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {//根据传入的方块数组和偏移，画出矩形
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {//将当前俄罗斯方块与方块主体结合起来（在确认碰撞后）
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {//方块下落，并检测碰撞及后续操作
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {//执行方块的左右偏移并检测碰撞
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {//刷新一个方块
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {//碰撞即游戏结束
        console.log('exit');
        arena.forEach(row => row.fill(0));
        finalScore = player.score;
        stopGame();
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {//执行方块的左右旋转并检测碰撞
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {//若旋转后会发生碰撞，则避让
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {//旋转俄罗斯方块
    for (let y = 0; y < matrix.length; ++y) {//沿对角线翻折矩阵
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {//顺时针旋转90
        matrix.forEach(row => row.reverse());
    } else {//逆时针旋转90
        matrix.reverse();
    }
}

document.addEventListener('keydown', event => {//响应函数
    if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowRight") {
        playerMove(1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.key === "q" || event.key === "Q") {
        playerRotate(-1);
    } else if (event.key === "w" || event.key === "W") {
        playerRotate(1);
    }
});

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

const colorSets = {//方块颜色
    set1: [
        null,
        '#FF0D72',
        '#0DC2FF',
        '#0DFF72',
        '#F538FF',
        '#FF8E0D',
        '#FFE138',
        '#3877FF',
    ],
    set2: [
        null,
        "#D50000",
        "#F57C00",
        "#FFEB3B",
        "#4CAF50",
        "#2196F3",
        "#3F51B5",
        "#9C27B0"
    ],
    set3: [
        null,
        "#C62828",
        "#FB8C00",
        "#FDD835",
        "#2E7D32",
        "#1565C0",
        "#283593",
        "#6A1B9A"
    ]
};

let colors = [//方块颜色
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const player = {//方块对象
    pos: { x: 5, y: 0 },
    matrix: null,
    score: 0,
};

let isGameRunning = false;

function update(time = 0) {//定义更新函数，执行游戏逻辑的更新，requestAnimationFrame来安排下一次的update调用
    /*time：时间戳，时间戳time是自动由浏览器提供的，并且每次浏览器准备进行重绘时，
    即在下一帧动画渲染前，requestAnimationFrame回调就会被调用，并接收一个新的时间戳。
    */
    if (!isGameRunning) {
        return; // 停止游戏更新
    }

    const deltaTime = time - lastTime;//计算两次绘制的时间差
    lastTime = time;//记录时间戳

    dropCounter += deltaTime;

    // console.log(time);
    // console.log(deltaTime);
    // console.log(lastTime);
    // console.log(dropCounter);

    // requestId = requestAnimationFrame(update); // 用变量存储请求ID

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();

    if (!isGameRunning) {
        return; // 停止游戏更新
    }

    requestId = requestAnimationFrame(update); // 用变量存储请求ID

    // requestId = requestAnimationFrame(update); // 用变量存储请求ID
    /*
    requestAnimationFrame(update) 是一种告诉浏览器你希望执行动画的方法，
    并且请求浏览器在下次重绘之前调用指定的函数来更新动画。这个方法是一个递归调用，
    意味着update函数在每次屏幕刷新之前都会被调用，通常是每秒60次。
    */
}

const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);//所有元素放大20倍

const arena = createMatrix(12, 20);//画布数组
// const arena = createMatrix(18, 30);

let dropCounter = 0;
let dropInterval = 1000;//游戏绘制定时间隔
let lastTime = 0;
let requestId; // 用于取消请求动画帧的变量

function startGame() {
    isGameRunning = true;

    document.getElementById("game-container").style.display = 'flex';

    // 重置游戏状态
    arena.forEach(row => row.fill(0));
    player.score = 0;
    playerReset();
    updateScore();
    // 开始动画循环
    if (!requestId) { // 防止多个游戏实例
        update();
    }
}

function stopGame() {
    if (requestId) {
        cancelAnimationFrame(requestId); // 取消请求动画帧
        requestId = undefined; // 清除requestId
        showModal();
        updateLeaderboardData(difficulty,["Player",finalScore]);
        updateLeaderboard();
    }
    isGameRunning = false;
    draw(); // 绘制最后一帧
}

function showHome() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("initial").style.display = "block";
}

function showStartGame() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("game").style.display = "block";
}

function showRankingList() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("list").style.display = "block";
}

function showIllustration() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("ins").style.display = "block";
}

function showTips() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("tips").style.display = "block";
}

function showAuthor() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("author").style.display = "block";
}

function showRelative() {
    const coms = document.getElementsByTagName("main")[0].getElementsByTagName("section");
    for (const com of coms) {
        com.style.display = "none";
    };
    document.getElementById("relative").style.display = "block";
}

document.getElementById("home").addEventListener("click", showHome);

document.getElementById("StartGame").addEventListener("click", showStartGame);
document.getElementById("RankingList").addEventListener("click", showRankingList);
document.getElementById("Illustration").addEventListener("click", showIllustration);

document.getElementById("Tips").addEventListener("click", showTips);
document.getElementById("Author").addEventListener("click", showAuthor);
document.getElementById("Relative").addEventListener("click", showRelative);

// 导出startGame和stopGame函数以便在全局范围内使用
window.startGame = startGame;
window.stopGame = stopGame;

const showColor = {//颜色展示器颜色
    set1: [
        '#FF0D72',
        '#0DC2FF',
        '#0DFF72',
        '#F538FF',
        '#FF8E0D',
        '#FFE138',
        '#3877FF',
    ],
    set2: [
        "#D50000",
        "#F57C00",
        "#FFEB3B",
        "#4CAF50",
        "#2196F3",
        "#3F51B5",
        "#9C27B0"
    ],
    set3: [
        "#C62828",
        "#FB8C00",
        "#FDD835",
        "#2E7D32",
        "#1565C0",
        "#283593",
        "#6A1B9A"
    ]
};

function updateColorDisplay(colors) {//更新颜色展示器展示的颜色
    const colorDisplay = document.getElementById('colorDisplay');
    colorDisplay.innerHTML = ''; // 清空现有的颜色

    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.classList.add('colorBox');
        colorBox.style.backgroundColor = color;
        colorDisplay.appendChild(colorBox);
    });
}

function reset() {
    // 设置难度选择器为"中等"
    document.getElementById('difficulty').value = 'medium';

    // 设置颜色集选择器为"set1"
    document.getElementById('colorSet').value = 'set1';

    // 可以在这里调用任何额外的更新函数，比如更新颜色展示器
    updateColorDisplay(showColor['set1']);
}

const colorSetSelector = document.getElementById('colorSet');

colorSetSelector.addEventListener('change', function () {//绑定颜色集选择器
    const selectedSet = showColor[this.value];
    updateColorDisplay(selectedSet);
});

updateColorDisplay(showColor['set1']);

document.getElementById('resetButton').addEventListener('click', reset);

let difficulty = "medium";

document.getElementById('startGameButton').addEventListener('click', function () {
    let selectedDiff = document.getElementById('difficulty').value;
    let selectedColorSet = document.getElementById('colorSet').value;
    reset();

    // console.log(selectedDiff);
    // console.log(selectedColorSet);

    difficulty = selectedDiff;

    switch (selectedDiff) {
        case "hard":
            dropInterval = 500;
            break;

        case "medium":
            dropInterval = 1000;
            break;

        case "easy":
            dropInterval = 1500;
            break;

        default:
            break;
    }

    colors = colorSets[selectedColorSet];

    document.getElementById('all').style.display = 'none';

    document.getElementById('game-screen').style.display = 'flex';

    startGame();

});

document.getElementById('exit').addEventListener('click', function () {
    finalScore = player.score;

    stopGame();

    // document.getElementById('game-screen').style.display = 'none';

    // document.getElementById('all').style.display = 'block';

});

// 弹出提示框
function showModal() {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    document.getElementById('score-text').innerText = "Your final Score is: "+finalScore+" !";
    document.getElementById('rank-text').innerText = "Your Score ranks in the top " +getPercentile(difficulty,finalScore)+"% of "+difficulty+" levels"+" !";

    span.onclick = function() {
        modal.style.display = "none";
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('all').style.display = 'block';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('all').style.display = 'block';
        }
    }
}

let finalScore = 0;




const leaderboardData = {
    hard: [],
    medium: [],
    easy: []
};

function initialLeaderboardData(difficulty, data) {
    leaderboardData[difficulty] = data;
    sortLeaderboard(difficulty);
}

function updateLeaderboardData(difficulty, data) {
    leaderboardData[difficulty].push(data);
    sortLeaderboard(difficulty);
}

function sortLeaderboard(difficulty) {
    leaderboardData[difficulty].sort((a, b) => b[1] - a[1]);
}

function updateLeaderboard() {
    const difficulty = document.getElementById('difficultySelector').value;
    const data = leaderboardData[difficulty];
    const leaderboardDiv = document.getElementById('leaderboard');

    // 清除现有的难度类（如果有的话）
    leaderboardDiv.className = '';

    // 添加新的难度类
    leaderboardDiv.classList.add(`difficulty-${difficulty}`);

    let html = `<table class="leaderboard-table ${difficulty}"><tr><th>Rank</th><th>Username</th><th>Score</th></tr>`;
    data.slice(0, 30).forEach((item, index) => {
        html += `<tr><td>${index + 1}</td><td>${item[0]}</td><td>${item[1]}</td></tr>`;
    });
    html += `</table>`;

    leaderboardDiv.innerHTML = html;
}

function getPercentile(difficulty, score) {
    const data = leaderboardData[difficulty];
    const total = data.length;
    const higherScoreCount = data.filter(item => item[1] > score).length;
    return ((higherScoreCount / total) * 100).toFixed(2);
}

// 示例数据更新
initialLeaderboardData('hard', [['User1', 10], ['User2', 80], ['User3', 20],['User4', 60], ['User5', 70], ['User6', 30],['User7', 50], ['User8', 10], ['User9', 40],['User10', 80], ['User12', 90], ['User13', 20],['User14', 110], ['User15', 30], ['User16', 30],['User17', 100], ['User18', 120], ['User19', 40],['User20', 120], ['User22', 140], ['User23', 20],['User24', 10], ['User25', 30], ['User26', 30],['User27', 10], ['User28', 20], ['User29', 40],['User31', 120], ['User32', 40], ['User33', 20],['User34', 20], ['User35', 30], ['User36', 10],['User37', 100], ['User38', 10], ['User39', 10]]);
initialLeaderboardData('medium', [['User4', 110], ['User5', 130], ['User6', 30]]);
initialLeaderboardData('easy', [['User7', 100], ['User8', 120], ['User9', 40]]);

// 初始化显示
updateLeaderboard();

