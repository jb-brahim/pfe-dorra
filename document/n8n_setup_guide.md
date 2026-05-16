# Full n8n Setup & Import Guide for RH Assistant

This document contains everything you need to set up your AI Recruitment Pipeline from scratch.

---

## Part 1: Installing n8n
If you don't have n8n installed yet, the easiest way is using **n8n Desktop** or **npm**.

### Option A: n8n Desktop (Easiest)
1. Download from [n8n.io/desktop](https://n8n.io/desktop/).
2. Install and open it.

### Option B: npm (If you have Node.js)
Run this in your terminal:
```bash
npm install n8n -g
n8n start
```

---

## Part 2: Preparing Credentials
Before starting the workflow, you need:
1. **Groq API Key**: Get it at [console.groq.com](https://console.groq.com/).
2. **Email App Password**: If using Gmail, you cannot use your regular password. Go to Google Account > Security > 2-Step Verification > App Passwords. Create one called "n8n".

---

## Part 3: Full Workflow JSON (Importable Code)
**To use this:** Copy the code below, go to n8n, and press **Ctrl+V** on the canvas.

```json
{
  "nodes": [
    {
      "parameters": {
        "postImportAction": "active",
        "options": {
          "downloadAttachments": true,
          "dataPropertyAttachments": "attachment"
        }
      },
      "id": "e72d2b51-7649-4f3e-a192-3c2d4f5e6a7b",
      "name": "Email Trigger (IMAP)",
      "type": "n8n-nodes-base.emailReadImap",
      "typeVersion": 1,
      "position": [400, 300],
      "credentials": {
        "imap": {
          "id": "YOUR_IMAP_CREDENTIAL_ID"
        }
      }
    },
    {
      "parameters": {
        "operation": "pdf",
        "binaryPropertyName": "attachment_0",
        "options": {}
      },
      "id": "a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3",
      "name": "Extract from File",
      "type": "n8n-nodes-base.extractFromFile",
      "typeVersion": 1,
      "position": [620, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"model\": \"llama3-8b-8192\",\n  \"messages\": [\n    {\n      \"role\": \"system\",\n      \"content\": \"You are an expert HR assistant. Extract candidate information from the text and return ONLY a JSON object with these keys: fullName, phone, summary, extractedSkills (array), education (string), experienceYears (number), certifications (array), languages (array), portfolioLinks (array), recommendationLevel ('Highly Recommended', 'Recommended', or 'Not Recommended').\"\n    },\n    {\n      \"role\": \"user\",\n      \"content\": \"CV Text: {{ $node[\\\"Extract from File\\\"].json[\\\"text\\\"] }}\\n\\nEmail Content: {{ $node[\\\"Email Trigger\\\"].json[\\\"text\\\"] }}\"\n    }\n  ],\n  \"response_format\": { \"type\": \"json_object\" }\n}",
        "options": {}
      },
      "id": "f1g2h3i4-j5k6-4l7m-n8o9-p0q1r2s3t4u5",
      "name": "Groq AI Analysis",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [840, 300],
      "credentials": {
        "httpHeaderAuth": {
          "id": "YOUR_GROQ_API_KEY_ID"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const aiContent = JSON.parse($input.item.json.choices[0].message.content);\nconst emailNode = $(\"Email Trigger (IMAP)\").first().json;\n\nreturn {\n  senderName: emailNode.from.name || aiContent.fullName,\n  senderEmail: emailNode.from.address,\n  subject: emailNode.subject,\n  body: emailNode.text,\n  category: \"Job Application\",\n  priority: \"Normal\",\n  ...aiContent\n};"
      },
      "id": "v1w2x3y4-z5a6-4b7c-d8e9-f0g1h2i3j4k5",
      "name": "Format for Backend",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1060, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:5000/api/webhooks/incoming-email",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ $json }}",
        "options": {}
      },
      "id": "l1m2n3o4-p5q6-4r7s-t8u9-v0w1x2y3z4a5",
      "name": "Send to Backend",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1280, 300]
    }
  ],
  "connections": {
    "Email Trigger (IMAP)": {
      "main": [
        [
          {
            "node": "Extract from File",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract from File": {
      "main": [
        [
          {
            "node": "Groq AI Analysis",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Groq AI Analysis": {
      "main": [
        [
          {
            "node": "Format for Backend",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format for Backend": {
      "main": [
        [
          {
            "node": "Send to Backend",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## Part 4: Step-by-Step Configuration

### 1. The Email Node
- Click on the node.
- Click **Add Credential**.
- Enter your email, `imap.gmail.com`, and your **App Password**.
- Make sure "Download Attachments" is checked.

### 2. The Groq Node
- You need a Header Auth credential:
    - **Name**: `Authorization`
    - **Value**: `Bearer YOUR_GROQ_API_KEY`
- The prompt inside this node is designed to extract exactly what your backend's `webhookController.js` expects.

### 3. The JS Code Node
This node performs a "Merge". It takes the text from the Email (sender, subject) and combines it with the JSON data from the AI (skills, name, experience).

### 4. The Backend Node
- **URL**: `http://localhost:5000/api/webhooks/incoming-email`.
- **Note**: If n8n is running in Docker and your backend is on Windows, use `http://host.docker.internal:5000/...` instead of `localhost`.

---

## Part 5: Testing
1. Click **Execute Workflow** in n8n.
2. Send an email to yourself with a PDF CV attached.
3. Watch n8n process it.
4. Check your Backend console/logs to see the candidate being created.
