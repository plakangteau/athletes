
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const uploadedImage = document.getElementById('uploaded-image');
    const imageUpload = document.getElementById('imageUpload');
    const fileName = document.getElementById('file-name');
    const analyzeButton = document.getElementById('analyze-button');
    const resultCard = document.getElementById('result-card');
    const initialMessage = document.getElementById('initial-message');
    const athleteImage = document.getElementById('athlete-image');
    const resultAthleteType = document.getElementById('result-athlete-type');
    const resultDescription = document.getElementById('result-description');
    const themeSwitch = document.getElementById('theme-switch');
    const themeLabel = document.querySelector('.theme-label');

    // --- Theme Switcher ---
    function setTheme(isDark) {
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        themeLabel.textContent = isDark ? '다크 모드' : '라이트 모드';
    }

    themeSwitch.addEventListener('change', () => {
        setTheme(themeSwitch.checked);
    });
    setTheme(themeSwitch.checked);

    // --- Face-API Initialization ---
    async function loadModels() {
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models')
            ]);
            initialMessage.textContent = "사진을 업로드하여 분석을 시작하세요.";
        } catch (error) {
            console.error("Error loading models: ", error);
            initialMessage.textContent = "모델을 로드하는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.";
        }
    }
    loadModels();

    // --- Media Handling ---
    function stopMediaTracks(stream) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    imageUpload.addEventListener('change', async () => {
        if (imageUpload.files && imageUpload.files[0]) {
            stopMediaTracks(video.srcObject); 
            
            const file = imageUpload.files[0];
            fileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                video.style.display = 'none';
                uploadedImage.style.display = 'block';
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            };
            reader.readAsDataURL(file);
        } else {
             fileName.textContent = '선택된 파일 없음';
        }
    });

    // --- Mock Analysis Data with All Athlete Types ---
    const mockResults = {
        '배드민턴선수 상': {
            description: '빠른 순발력과 정교한 컨트롤로 셔틀콕을 지배하는 당신은 네트의 지배자!',
            athlete: '/images/badminton.png'
        },
        '탁구선수 상': {
            description: '순간적인 반응 속도와 회전 마술을 부리는 당신은 작은 테이블 위의 거인!',
            athlete: '/images/ping-pong.png'
        },
        '골프선수 상': {
            description: '고요한 집중력과 완벽한 스윙으로 필드를 정복하는 당신은 녹색의 신사!',
            athlete: '/images/golf.png'
        },
        '테니스선수 상': {
            description: '강력한 서브와 지치지 않는 체력으로 코트를 누비는 당신은 테니스의 황제!',
            athlete: '/images/tennis.png'
        },
        '육상선수 상': {
            description: '바람을 가르는 스피드와 한계를 넘어서는 의지를 가진 당신은 트랙의 전설!',
            athlete: '/images/track-and-field.png'
        }
    };

    // --- "Analyze" Button Logic ---
    analyzeButton.addEventListener('click', async () => {
        if (!uploadedImage.src || uploadedImage.style.display === 'none' || !uploadedImage.complete) {
            initialMessage.textContent = "분석할 사진이 없습니다. 먼저 사진을 업로드해주세요.";
            return;
        }

        initialMessage.style.display = 'none';
        resultCard.classList.add('hidden');
        analyzeButton.disabled = true;
        analyzeButton.textContent = '분석 중...';

        const detections = await faceapi.detectSingleFace(uploadedImage, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

        if (detections) {
            const expressions = detections.expressions;
            const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            let resultPool = [];
            switch (dominantExpression) {
                case 'happy':
                    resultPool = ['테니스선수 상'];
                    break;
                case 'surprised':
                    resultPool = ['육상선수 상'];
                    break;
                case 'neutral':
                    resultPool = ['골프선수 상', '탁구선수 상'];
                    break;
                case 'sad':
                case 'angry':
                case 'fearful':
                case 'disgusted':
                    resultPool = ['배드민턴선수 상'];
                    break;
                default:
                    resultPool = Object.keys(mockResults); // Fallback to all
            }
            
            const resultType = resultPool[Math.floor(Math.random() * resultPool.length)];
            const result = mockResults[resultType];

            const img = new Image();
            img.src = result.athlete;
            img.onload = () => {
                athleteImage.src = img.src;
                resultAthleteType.textContent = resultType;
                resultDescription.textContent = result.description;
                resultCard.classList.remove('hidden');
                analyzeButton.disabled = false;
                analyzeButton.textContent = '분석하기';
            };
            img.onerror = (e) => {
                 console.error("Error loading image:", img.src, e);
                 initialMessage.textContent = "결과 이미지를 불러오는데 실패했습니다. 이미지 경로를 확인해주세요.";
                 initialMessage.style.display = 'block';
                 analyzeButton.disabled = false;
                 analyzeButton.textContent = '분석하기';
            }

        } else {
            initialMessage.textContent = "얼굴을 찾을 수 없습니다. 다른 사진이나 각도를 시도해보세요.";
            initialMessage.style.display = 'block';
            analyzeButton.disabled = false;
            analyzeButton.textContent = '분석하기';
        }
    });
});
