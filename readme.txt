my_dashboard_app/
├── app.py                # Flask 백엔드 메인 파일
├── requirements.txt      # 필요 라이브러리 목록
├── templates/            # Jinja2 템플릿 폴더
│   ├── base.html         # 공통 레이아웃 (헤더, 사이드바 포함)
│   ├── sidebar.html      # 사이드바 메뉴 구성
│   ├── dashboard.html    # 대시보드 페이지 템플릿
│   └── sensors.html      # 센서 페이지 템플릿
└── static/               # 정적 파일 (CSS, JS, 이미지)
    ├── css/
    │   ├── style.css     # 공통 스타일
    │   └── sidebar.css   # 사이드바 전용 스타일
    └── js/
        └── sidebar.js    # 사이드바 토글 및 AJAX 페이지 로딩 스크립트
        └── users.js      # 유저 관리