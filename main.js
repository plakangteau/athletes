
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const uploadedImage = document.getElementById('uploaded-image');
    const imageUpload = document.getElementById('imageUpload');
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
    // Set initial theme based on checkbox
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
            startMedia();
        } catch (error) {
            console.error("Error loading models: ", error);
            initialMessage.textContent = "모델을 로드하는 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.";
        }
    }
    loadModels();

    // --- Media Handling ---
    function startMedia() {
        startVideo(); // Default to webcam
    }

    function startVideo() {
        video.style.display = 'block';
        uploadedImage.style.display = 'none';
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                video.srcObject = stream;
            })
            .catch(err => {
                console.error("Error accessing webcam: ", err);
                initialMessage.textContent = "웹캠에 접근할 수 없습니다. 권한을 확인해주세요.";
            });
    }

    imageUpload.addEventListener('change', async () => {
        if (imageUpload.files && imageUpload.files[0]) {
            // Stop video stream if it's running
            if (video.srcObject) {
                const stream = video.srcObject;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                video.style.display = 'none';
                uploadedImage.style.display = 'block';
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
            };
            reader.readAsDataURL(imageUpload.files[0]);
        }
    });

    video.addEventListener('play', () => {
        const displaySize = { width: video.clientWidth, height: video.clientHeight };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            if (video.style.display !== 'none' && !video.paused) {
                const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
            }
        }, 100);
    });

    // --- Mock Analysis Data ---
    const mockResults = {
        '축구선수 상': {
            description: '넓은 시야와 빠른 판단력을 가진 당신은 그라운드의 지배자!',
            athlete: 'https://i.namu.wiki/i/Plt-TEaF_9aI1Yk2j2aJm2_S0GSAHl2o7p0Jp3z2QjY2jZgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJgJjJg.webp' // Son Heung-min
        },
        '농구선수 상': {
            description: '높은 점프력과 정확한 슛 감각을 지닌 당신은 코트의 해결사!',
            athlete: 'https://i.namu.wiki/i/250px-stephen_curry_2022_finals.jpeg' // Stephen Curry
        },
        '수영선수 상': {
            description: '유연한 몸과 강한 지구력을 가진 당신은 물살을 가르는 돌고래!',
            athlete: 'https://i.namu.wiki/i/220px-michael_phelps_london_2012.jpeg' // Michael Phelps
        }
    };

    // --- "Analyze" Button Logic ---
    analyzeButton.addEventListener('click', async () => {
        initialMessage.style.display = 'none';
        resultCard.classList.add('hidden');
        analyzeButton.disabled = true;
        analyzeButton.textContent = '분석 중...';

        let elementToAnalyze = video.style.display !== 'none' ? video : uploadedImage;

        // Ensure image is fully loaded before analysis
        if (elementToAnalyze.tagName === 'IMG' && !elementToAnalyze.complete) {
             await new Promise(resolve => elementToAnalyze.onload = resolve);
        }

        const detections = await faceapi.detectSingleFace(elementToAnalyze, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();

        if (detections) {
            const expressions = detections.expressions;
            // Determine dominant expression
            const dominantExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            let resultType;
            // Map expression to athlete type
            switch (dominantExpression) {
                case 'happy':
                case 'surprised':
                    resultType = '농구선수 상';
                    break;
                case 'neutral':
                case 'sad':
                    resultType = '축구선수 상';
                    break;
                default: // angry, disgusted, fearful
                    resultType = '수영선수 상';
            }

            const result = mockResults[resultType];

            // Display results
            setTimeout(() => {
                athleteImage.src = result.athlete;
                resultAthleteType.textContent = resultType;
                resultDescription.textContent = result.description;
                resultCard.classList.remove('hidden');
            }, 500); // Short delay for effect

        } else {
            initialMessage.textContent = "얼굴을 찾을 수 없습니다. 다른 사진이나 각도를 시도해보세요.";
            initialMessage.style.display = 'block';
        }

        analyzeButton.disabled = false;
        analyzeButton.textContent = '분석하기';
    });
});
