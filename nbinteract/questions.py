import ipywidgets as widgets
from IPython.display import display

__all__ = ['multiple_choice', 'short_answer']

# css style for question and answers
TEXT_STYLE = '<p style="line-height:18px;">{}</p>'


def multiple_choice(question, answer_list, correct_answer_list):
    """
    Generates a multiple choice question that allows the user to select an
    answer choice and displays the correctness of that choice.

    Args:
        ''question'' -- (string)
        The question being asked.
        ''answer_list'' -- (list of strings)
        The possible answer choices.
        ''correct_answeer_list'' -- (string)
        List of all correct answers.

    Returns:
        None

    >>> multiple_choice(question="What is 1+1?",
    ...                 answer_list=['1', '2', '3'],
    ...                 correct_answer = '2')
    <What is 1+1>
    <Button> <1>
    <Button> <2>
    <Button> <3>
    """
    # make sure question is a string
    assert type(question) == str
    # store mapping to map buttons to the corresponding answer
    button_answer_mapping = dict()

    # interactive function that turns button green if correct and red otherwise
    def check_answer(answer_content):
        if button_answer_mapping[answer_content] in correct_answer_list:
            answer_content.style.button_color = '#71B307'
        else:
            answer_content.style.button_color = '#F86700'

    # build button_answer mapping and interaction for buttons
    answer_choices = []
    for answer in answer_list:
        new_button = widgets.Button(layout=widgets.Layout(width='20px',
                                                          height='20px',
                                                          padding='0'))
        new_button.on_click(check_answer)
        button_answer_mapping[new_button] = answer
        answer_tag = widgets.HTML(TEXT_STYLE.format(answer))
        button_and_question = widgets.HBox([new_button, answer_tag])
        button_and_question.layout.align_items = 'center'
        answer_choices.append(button_and_question)
    question_tag = widgets.HTML(TEXT_STYLE.format(question))
    display(widgets.VBox([question_tag] + answer_choices))


CHECK_ICON = ('<i class="fa fa-check" aria-hidden="true"'
              'style="color:#71B307; font-size:2rem"></i>')
X_ICON = ('<i class="fa fa-times" aria-hidden="true"'
          'style="color:#F86700; font-size:2rem"></i>')


def short_answer(question, answer_list=[], check_function=lambda x: False, explanation=None):
    """
    Generates a short answer question that allows user to input an answer in
    a textbox and a submit button to output the correctness of the answer.

    Args:
        ''question'' --(string)
        The question being asked.
        ''answer'' --(string)
        A list of correct answers.
        ''explanation'' --(string)
        The explanation to the question is displayed when the user inputs
        the correct answer.

    Returns:
        None

    >>> short_answer('What is 1+1??', '2') #doctest: +SKIP
    <What is 1+1?>
    <Input box, Submit button>
    """
    # Input textbox
    user_answer = widgets.Text(placeholder='Write your answer here')
    # Submit button
    submit_button = widgets.Button(description='Submit')
    # Space right of the submit button to show checkmark/x-mark
    visual_correct = widgets.HTML()
    # Space below input line to display explanation if answer is correct
    explanation_space = widgets.HTML()

    # correctness function linked to the submit button
    def check_answer(text_content):
        try:
            user_answer_value = int(user_answer.value)
        except ValueError:
            user_answer_value = user_answer.value
        if user_answer_value in answer_list or check_function(user_answer_value):
            visual_correct.value = CHECK_ICON
            if explanation:
                explanation_space.value = explanation
        else:
            visual_correct.value = X_ICON
    submit_button.on_click(check_answer)
    question_tag = widgets.HTML(TEXT_STYLE.format(question))
    user_input_line = widgets.HBox([user_answer,
                                   submit_button, visual_correct])
    display(widgets.VBox([question_tag, user_input_line, explanation_space]))
