# MetricMate: LLM-Supported Criteria Generation

MetricMate is a **full-stack application** for generating evaluation criteria with the help of Large Language Models (LLMs).  
It provides a **Python backend** for API handling and model interaction, and a **JavaScript/React frontend** for an interactive user interface.

---

## Overview
MetricMate helps users **define and refine evaluation criteria** for model assessments by leveraging OpenAI’s language models.  
It is designed for **researchers, evaluators, and AI practitioners** who want to:

- Automate criteria creation for experiments
- Standardize evaluation frameworks
- Quickly adapt metrics to different tasks

---



## Getting Started

### Backend Setup


1. Install dependencies
```bash
pip install -r requirements.txt
```

2. Configure API key
Update backend/config.ini with your personal OpenAI API key:
```ini
api_key = YOUR_OPENAI_API_KEY
```

3. Run the backend
```bash
python main.py
```

## Running the frontend

1. Install dependencies
```bash
npm install
```

2. Start the frontend
```bash
npm start
```




# Reference
If you use our tools/code for your work, please cite the following paper:

```bash
@inproceedings{gebreegziabher2025metricmate,
  title={MetricMate: An Interactive Tool for Generating Evaluation Criteria for LLM-as-a-Judge Workflow},
  author={Gebreegziabher, Simret Araya and Chiang, Charles and Wang, Zichu and Ashktorab, Zahra and Brachman, Michelle and Geyer, Werner and Li, Toby Jia-Jun and G{\'o}mez-Zar{\'a}, Diego},
  booktitle={Proceedings of the 4th Annual Symposium on Human-Computer Interaction for Work},
  pages={1--18},
  year={2025}
}
```