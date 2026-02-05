
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
            // Don't start camera automatically, wait for user action.
            initialMessage.textContent = "카메라를 켜거나 사진을 업로드하여 분석을 시작하세요.";
        } catch (error) {
            console.error("Error loading models: ", error);
            initialMessage.textContent = "모델을 로드하는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.";
        }
    }
    loadModels();

    // --- Media Handling ---
    // Function to stop existing video streams
    function stopMediaTracks(stream) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    // The `capture` attribute in HTML will prefer the camera on mobile.
    // This function handles the file selection, whether from camera or files.
    imageUpload.addEventListener('change', async () => {
        if (imageUpload.files && imageUpload.files[0]) {
            stopMediaTracks(video.srcObject); // Stop any active camera stream
            
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

    // Simplified logic: Remove automatic camera start and live analysis.
    // Analysis is now only triggered by the "Analyze" button.

    // --- Mock Analysis Data with Cartoon Images ---
    const mockResults = {
        '축구선수 상': {
            description: '넓은 시야와 빠른 판단력을 가진 당신은 그라운드의 지배자!',
            athlete: 'https://i.imgur.com/g8e1cR0.png' // Soccer cartoon
        },
        '농구선수 상': {
            description: '높은 점프력과 정확한 슛 감각을 지닌 당신은 코트의 해결사!',
            athlete: 'https://i.imgur.com/J3GfT5q.png' // Basketball cartoon
        },
        '수영선수 상': {
            description: '유연한 몸과 강한 지구력을 가진 당신은 물살을 가르는 돌고래!',
            athlete: 'https://i.imgur.com/nLd5gP7.png' // Swimming cartoon
        }
    };

    // --- "Analyze" Button Logic ---
    analyzeButton.addEventListener('click', async () => {
        if (!uploadedImage.src || uploadedImage.style.display === 'none') {
            initialMessage.textContent = "분석할 사진이 없습니다. 먼저 사진을 업로드해주세요.";
            return;
        }

        initialMessage.style.display = 'none';
        resultCard.classList.add('hidden');
        analyzeButton.disabled = true;
        analyzeButton.textContent = '분석 중...';

        // Ensure image is fully loaded before analysis
        if (!uploadedImage.complete) {
             await new Promise(resolve => uploadedImage.onload = resolve);
        }

        const detections = await faceapi.detectSingleFace(uploadedImage, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

        if (detections) {
            const expressions = detections.expressions;
            const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            let resultType;
            switch (dominantExpression) {
                case 'happy':
                case 'surprised':
                    resultType = '농구선수 상';
                    break;
                case 'neutral':
                case 'sad':
                    resultType = '축구선수 상';
                    break;
                default:
                    resultType = '수영선수 상';
            }

            const result = mockResults[resultType];

            setTimeout(() => {
                athleteImage.src = result.athlete; 
                resultAthleteType.textContent = resultType;
                resultDescription.textContent = result.description;
                resultCard.classList.remove('hidden');
            }, 500); 

        } else {
            initialMessage.textContent = "얼굴을 찾을 수 없습니다. 다른 사진이나 각도를 시도해보세요.";
            initialMessage.style.display = 'block';
        }

        analyzeButton.disabled = false;
        analyzeButton.textContent = '분석하기';
    });
});
