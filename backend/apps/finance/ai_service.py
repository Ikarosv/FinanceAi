import os
from groq import Groq
# from langchain_groq import ChatGroq
# from langchain.prompts import ChatPromptTemplate
from .models import Transaction

class FinancialAI:
    def __init__(self):
        # Usando o Groq com o modelo Llama 3
        self.client = Groq()

    def analyze_spending(self, user):
        # Buscamos as transações do usuário para dar contexto à IA
        transactions = Transaction.objects.filter(user=user).select_related('category')
        
        if not transactions.exists():
            return "Você ainda não possui transações para análise."

        # Formatando os dados para a IA entender
        data_text = "\n".join([
            f"- {t.date}: {t.description} | R$ {t.amount} | Tipo: {t.get_type_display()}"
            for t in transactions
        ])

        try:
            chat_completion = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                max_tokens=500,
                temperature=0.7,
                messages=[
                    {"role": "system", "content": (
                        "Você é um especialista em finanças pessoais. "
                        "Analise a lista de transações do usuário e forneça um resumo crítico "
                        "sobre onde ele está gastando mais e uma dica prática de economia."
                    )},
                    {"role": "user", "content": f"Aqui estão meus gastos: \n{data_text}"},
                ],
            )
        except Exception:
            return (
                "Não foi possível gerar a análise agora. "
                "Verifique a configuração da IA e tente novamente em instantes."
            )

        return chat_completion.choices[0].message.content