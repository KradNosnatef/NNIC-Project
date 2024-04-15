from openai import OpenAI
import gradio as gr

def submitText(text):
    client = OpenAI()
    completion = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": 
            """
                You are a Singaporean Navigation Assistant.\n
                The user will ask you to search for a route from the nearest designated type of public service location to a specified location.\n
                You must search the public service location that matches user's query, then show a route from that public service location to the specified location.\n
                You will provide a route by providing start point name and end point name.\n
                Your response must strictly be in following format:[StartPointName#EndPointName]\n
            """
            },
            {"role": "user", "content": text}
        ]
    )

    returnText=str(completion.choices[0].message.content)[1:-1]
    returns=returnText.split("#")

    returns[0]=returns[0].replace(" ","+")
    returns[1]=returns[1].replace(" ","+")

    returns[0]="[\""+returns[0]+",+Singapore\","
    returns[1]="\""+returns[1]+",+Singapore\"]"
    returnText=returns[0]+returns[1]
    print(returnText)
    return(gr.HTML("<iframe src=http://fuqianshan.asuscomm.com:5173?body="+returnText+" width=100%% height=520px></iframe>"))

with gr.Blocks(title="BooleanPirates") as demo:
    with gr.Group():
        text=gr.Textbox(show_label=False)
        htmlBox=gr.HTML("<iframe src=http://fuqianshan.asuscomm.com:5173?body=[\"Fire+Station+Bukit+Merah,+Singapore\",\"SMU,+Singapore\"] width=100%% height=520px></iframe>")

        text.submit(submitText,text,htmlBox)

demo.launch(server_name="0.0.0.0",server_port=7920)

input()