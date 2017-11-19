import ipywidgets as widgets
from IPython.display import display


def multiple_choice(question, answer_list, correct_answer):
    """
    Generates a multiple choice question that allows the user to select an
    answer choice and displays the correctness of that choice.

    Args:
        ''question'' -- (string)
        The question being asked.
        ''answer_list'' -- (list of strings)
        The possible answer choices.
        ''correct_answeer'' -- (string)
        The correct answer for the question.

    Returns:
        None
    """
    # make sure question is a string
    assert type(question) == str
    # store mapping to map buttons to the corresponding answer
    button_answer_mapping = dict()

    # interactive function that turns button green if correct and red otherwise
    def check_correct_answer(answer_content):
        if button_answer_mapping[answer_content] == correct_answer:
            answer_content.style.button_color = '#71B307'
        else:
            answer_content.style.button_color = '#F86700'
    # css style for question and answers
    style = '<p style="line-height:18px;">{}</p>'
    # build button_answer mapping and interaction for buttons
    answer_choices = []
    for answer in answer_list:
        new_button = widgets.Button(layout=widgets.Layout(width='20px',
                                                          height='20px',
                                                          padding='0'))
        new_button.on_click(check_correct_answer)
        button_answer_mapping[new_button] = answer
        answer_tag = widgets.HTML(style.format(answer))
        button_and_question = widgets.HBox([new_button, answer_tag])
        button_and_question.layout.align_items = 'center'
        answer_choices.append(button_and_question)
    question_tag = widgets.HTML(style.format(question))
    display(widgets.VBox([question_tag] + answer_choices))
