from flask import Flask, render_template, request, jsonify
import pandas as pd
import plotly.express as px
import plotly.figure_factory as ff
from datetime import datetime

# Flask 웹 애플리케이션 생성
app = Flask(__name__)

# ── 클라이언트 요청 직전에 정보 로깅 ──
@app.before_request
def log_client_request():
    # 현재 시각, 클라이언트 IP, 요청 경로, User-Agent 등 로그 출력
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    print(f"[접속 시각] {now}")
    print(f"[클라이언트 IP] {request.remote_addr}")
    print(f"[요청 경로] {request.method} {request.path}")
    print(f"[User-Agent] {request.headers.get('User-Agent')}")
    ref = request.headers.get('Referer')
    if ref:
        print(f"[Referer] {ref}")
    print('-' * 60)

# ---------- 샘플 데이터 ----------
# 차트 및 테이블에 사용할 샘플 데이터 정의
bar_data = pd.DataFrame({
    'Month': ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    'Value': [400, 300, 500, 200, 350]
})
donut_data = pd.DataFrame({
    'Category': ['A', 'B', 'C', 'D'],
    'Value': [240, 130, 100, 230]
})
gantt_data = pd.DataFrame([
    dict(Task='Task A', Start='2025-01-01', Finish='2025-01-04'),
    dict(Task='Task B', Start='2025-01-02', Finish='2025-01-07'),
    dict(Task='Task C', Start='2025-01-05', Finish='2025-01-07'),
])
sensor_data = pd.DataFrame({
    'Time': ['10:00', '11:00', '12:00', '13:00', '14:00'],
    'Value': [20, 35, 28, 50, 45]
})

# Plotly를 이용해 막대그래프 생성
def make_bar():
    fig = px.bar(bar_data, x='Month', y='Value', title='월별 값')
    return fig.to_html(full_html=False, include_plotlyjs='cdn')

# Plotly를 이용해 도넛차트 생성
def make_donut():
    fig = px.pie(pd.DataFrame({'Category':['A','B','C','D'],'Value':[240,130,100,230]}),
                 names='Category', values='Value', hole=0.5, title='카테고리 분포')
    return fig.to_html(full_html=False, include_plotlyjs='cdn')

# Plotly를 이용해 간트차트(프로젝트 타임라인) 생성
def make_gantt():
    fig = ff.create_gantt(
        gantt_data,
        index_col='Task',
        show_colorbar=True,
        title='Project Timeline',
        bar_width=0.3
    )
    return fig.to_html(full_html=False, include_plotlyjs='cdn')

# Plotly를 이용해 센서 데이터 라인차트 생성
def make_sensor():
    fig = px.line(pd.DataFrame({'Time':['10:00','11:00','12:00','13:00','14:00'],'Value':[20,35,28,50,45]}),
                   x='Time', y='Value', title='실시간 센서 값')
    return fig.to_html(full_html=False, include_plotlyjs='cdn')

# ---------- 사용자 데이터 (샘플) ----------
# 사용자 목록을 리스트로 관리 (실제 서비스에서는 DB 사용 권장)
users = [
    {'id':1,'name':'홍길동','phone':'010-1234-5678','email':'hong@example.com'},
    {'id':2,'name':'김영희','phone':'010-2345-6789','email':'kim@example.com'},
    {'id':3,'name':'이철수','phone':'010-3456-7890','email':'lee@example.com'}
]

# ---------- 라우트(페이지) 설정 ----------
@app.route('/')
def dashboard():
    # 대시보드 페이지 렌더링 (차트, 간트, 테이블 포함)
    return render_template(
        'dashboard.html',
        bar_div=make_bar(),
        donut_div=make_donut(),
        gantt_div=make_gantt(),
        table=gantt_data.to_dict('records'),
        columns=gantt_data.columns.tolist()
    )

@app.route('/sensors')
def sensors():
    # 센서 데이터 페이지 렌더링 (차트, 테이블 포함)
    return render_template(
        'sensors.html',
        sensor_div=make_sensor(),
        table=sensor_data.to_dict('records'),
        columns=sensor_data.columns.tolist()
    )

@app.route('/users')
def users_page():
    # 사용자 관리 페이지 렌더링 (사용자 목록 전달)
    return render_template('users.html', users=users)

@app.route('/users/create', methods=['POST'])
def create_user():
    # 사용자 추가 요청 처리 (AJAX)
    data = request.get_json()
    new_id = max([u['id'] for u in users] or [0]) + 1
    user = {'id': new_id, 'name': data['name'], 'phone': data['phone'], 'email': data['email']}
    users.append(user)
    return jsonify({'success': True, 'user': user})

@app.route('/users/update', methods=['POST'])
def update_user():
    # 사용자 정보 수정 요청 처리 (AJAX)
    data = request.get_json()
    uid = int(data.get('id'))
    for u in users:
        if u['id'] == uid:
            u['name'] = data.get('name')
            u['phone'] = data.get('phone')
            u['email'] = data.get('email')
            return jsonify({'success': True, 'user': u})
    return jsonify({'success': False}), 404

@app.route('/users/delete', methods=['POST'])
def delete_user():
    # 사용자 삭제 요청 처리 (AJAX)
    data = request.get_json()
    uid = int(data.get('id'))
    global users
    users = [u for u in users if u['id'] != uid]
    return jsonify({'success': True})

if __name__ == '__main__':
    # 개발 서버 실행 (포트 5000)
    app.run(debug=True,port=5000)