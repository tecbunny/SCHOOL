# Gemini AI API Documentation

This document specifies the integration of Google Gemini models into the EduPortal ecosystem.

## 🚀 Overview
EduPortal leverages the **Gemini 3.1 Enterprise Agent Platform** for advanced academic orchestration, including handwriting OCR, subjective grading, and automated assessment generation.

## 🛠️ Models & Usage

| Task | Model | Rationale |
| :--- | :--- | :--- |
| **Syllabus Indexing** | `gemini-3.1-pro` | Large context window for complex curriculum mapping. |
| **Subjective Grading** | `gemini-3.1-flash` | Fast, cost-effective reasoning for worksheet analysis. |
| **OCR & Vision** | `gemini-3.1-flash` | High-fidelity extraction of handwritten student work. |
| **Quiz Generation** | `gemini-3.1-flash` | Rapid structured output for MCQ generation. |
| **Compliance Audit** | `gemini-3.1-pro` | Deep thinking capability for NEP 2020 regulatory checks. |

## 🧠 Key Capabilities

### 1. Structured Output
All API responses from Gemini are enforced to be valid JSON. We utilize system instructions and schema enforcement to ensure data integrity.

### 2. Thinking Mode
For complex reasoning tasks (like Auditor compliance checks), we enable the "Thinking" capability to allow the model to process multifaceted regulatory requirements before outputting a result.

### 3. Vision Analysis
Worksheets are processed as base64 images, allowing the model to bridge the physical-to-digital gap for teacher grading workflows.

## 🛡️ Safety & Limitations
To ensure pedagogical integrity and platform safety, all Gemini instances are initialized with strict **System Instructions**:
- **Domain Constraint**: The model is restricted to educational and academic content only.
- **Output Safety**: It is prohibited from generating harmful, political, or non-educational content.
- **Structural Integrity**: The model is mandated to output only raw JSON to prevent parsing failures in the automated grading pipeline.
- **No Conversation**: All models operate in a stateless, single-turn mode for maximum efficiency and security.

## 🔗 Reference Documentation
- [Gemini Enterprise Agent Platform - Getting Started](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start)
- [Gemini 3.1 Model Overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/google-models)
