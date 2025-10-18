from flask import Flask, render_template, jsonify, request
import random

app = Flask(__name__)

# Data instruksi permainan
INSTRUCTIONS = [
    {"step": 1, "value": 6, "description": "Lompat maju +6", "from": -10, "to": -4},
    {"step": 2, "value": 3, "description": "Lompat maju +3", "from": -4, "to": -1},
    {"step": 3, "value": 5, "description": "Lompat maju +5", "from": -1, "to": 4},
    {"step": 4, "value": -2, "description": "Lompat mundur -2", "from": 4, "to": 2},
    {"step": 5, "value": 4, "description": "Lompat maju +4", "from": 2, "to": 6},
    {"step": 6, "value": -1, "description": "Lompat mundur -1", "from": 6, "to": 5},
    {"step": 7, "value": 3, "description": "Lompat maju +3", "from": 5, "to": 8},
    {"step": 8, "value": 2, "description": "Lompat maju +2", "from": 8, "to": 10}
]

@app.route('/')
def index():
    return render_template('index.html', instructions=INSTRUCTIONS)

@app.route('/api/instructions')
def get_instructions():
    return jsonify(INSTRUCTIONS)

@app.route('/api/check_position', methods=['POST'])
def check_position():
    data = request.json
    player_pos = data.get('position')
    step = data.get('step')
    
    if step <= len(INSTRUCTIONS):
        correct_pos = INSTRUCTIONS[step - 1]['to']
        is_correct = player_pos == correct_pos
        return jsonify({
            'correct': is_correct,
            'correct_position': correct_pos
        })
    return jsonify({'error': 'Invalid step'}), 400

@app.route('/api/get_result', methods=['POST'])
def get_result():
    data = request.json
    correct_count = data.get('correct_count', 0)
    
    if correct_count < 4:
        level = "Inferior"
        code = "PB1017"
    elif correct_count <= 6:
        level = "Reguler"
        code = "PB1018"
    else:
        level = "Superior"
        code = "PB1019"
    
    return jsonify({
        'level': level,
        'code': code,
        'correct_count': correct_count,
        'total': 8
    })

if __name__ == '__main__':
    app.run(debug=True, port=5055)