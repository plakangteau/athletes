
document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyze-button');
    const resultCard = document.getElementById('result-card');
    const initialMessage = document.getElementById('initial-message');
    const resultImage = document.getElementById('result-image');
    const resultAthleteType = document.getElementById('result-athlete-type');
    const resultDescription = document.getElementById('result-description');

    // 모의 데이터 (실제 분석 로직으로 교체 예정)
    const mockResults = [
        {
            type: '축구선수 상',
            description: '넓은 시야와 빠른 판단력을 가진 당신은 그라운드의 지배자!',
            image: 'https://images.unsplash.com/photo-1553778263-73a83bab9b82?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
            type: '농구선수 상',
            description: '높은 점프력과 정확한 슛 감각을 지닌 당신은 코트의 해결사!',
            image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
            type: '수영선수 상',
            description: '유연한 몸과 강한 지구력을 가진 당신은 물살을 가르는 돌고래!',
            image: 'https://images.unsplash.com/photo-1560093849-53fe1a8c9193?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
    ];

    analyzeButton.addEventListener('click', () => {
        // 로딩 메시지 (필요 시 추가)
        initialMessage.style.display = 'none';
        resultCard.classList.add('hidden');

        // 임의의 결과 선택 (모의)
        const randomIndex = Math.floor(Math.random() * mockResults.length);
        const randomResult = mockResults[randomIndex];

        // 결과 표시
        setTimeout(() => {
            resultImage.src = randomResult.image;
            resultAthleteType.textContent = randomResult.type;
            resultDescription.textContent = randomResult.description;
            resultCard.classList.remove('hidden');
        }, 1000); // 1초 지연으로 분석하는 듯한 효과
    });
});
