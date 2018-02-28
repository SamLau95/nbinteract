import collections
import ipywidgets as widgets
from IPython.display import display
from toolz import curry

__all__ = ['multiple_choice', 'short_answer']

# css style for question and answers
TEXT_STYLE = '<p style="line-height:18px;">{}</p>'

GREEN = '#71B307'
RED = '#F86700'


def multiple_choice(question, choices, answers):
    """
    Generates a multiple choice question that allows the user to select an
    answer choice and shows whether choice was correct.

    Args:
        question (str): Question text displayed above choices.

        choices (list str): Answer choices that user can select.

        answers (int | iterable int): Either an integer or iterable of
            integers. Each integer in answers corresponds to the index of the
            correct choice in `choices`.

    Returns:
        None

    >>> multiple_choice(question="What is 10 + 2 * 5?",
    ...                 choices=['12', '60', '20'],
    ...                 answers=2) #doctest: +SKIP
    <What is 10 + 2 * 5?>
    <Button> <12>
    <Button> <60>
    <Button> <20>   (Correct)
    >>> multiple_choice(question="Select all prime numbers.",
    ...                 choices=['12', '3', '31'],
    ...                 answers=[1, 2]) #doctest: +SKIP
    <Select all prime numbers.>
    <Button> <12>
    <Button> <3>    (Correct)
    <Button> <31>   (Correct)
    """
    if not isinstance(answers, (int, collections.Iterable)):
        raise TypeError(
            'The `answers` arg is expected to be of type '
            '(int | iterable int) but got {} instead.'.format(type(answers))
        )

    @curry
    def check_answer(index, button):
        is_correct = (
            index == answers if isinstance(answers, int) else index in answers
        )
        button.style.button_color = GREEN if is_correct else RED

    answer_choices = []
    for index, choice in enumerate(choices):
        button = widgets.Button(
            layout=widgets.Layout(width='20px', height='20px', padding='0')
        )
        button.on_click(check_answer(index))

        button_and_question = widgets.HBox(
            [button, widgets.HTML(TEXT_STYLE.format(choice))],
            layout=widgets.Layout(align_items='center')
        )

        answer_choices.append(button_and_question)

    question_html = [widgets.HTML(TEXT_STYLE.format(question))]
    display(widgets.VBox(question_html + answer_choices))


CHECK_ICON = (
    '<i class="fa fa-check" aria-hidden="true"'
    'style="color:#71B307; font-size:2rem"></i>'
)
X_ICON = (
    '<i class="fa fa-times" aria-hidden="true"'
    'style="color:#F86700; font-size:2rem"></i>'
)


def short_answer(question, answers, explanation=None):
    """
    Generates a short answer question that allows user to input an answer in
    a textbox and a submit button to check the answer.

    Args:
        question (str):  The question being asked.

        answers (str | list str | func): If a string, only that string will be
            marked correct. If a list of string, any string in the list will be
            marked correct. If a function, any input that causes the function
            to return True will be marked correct.

        explanation (str):  The explanation to the question is displayed when
            the user inputs the correct answer.

    Returns:
        None

    >>> short_answer('What is 1 + 1?', '2',
    ...              explanation='1+1 is 2') #doctest: +SKIP
    <What is 1+1?>
    <Input box, Submit button>
    >>> short_answer('Enter the first name of a member of the Beatles.',
    ...              ['John', 'Paul', 'George', 'Ringo']) #doctest: +SKIP
    <Enter the first name of a member of the Beatles.>
    <Input box, Submit button>
    >>> short_answer('Enter an even number.',
    ...              lambda x: int(x) % 2 == 0) #doctest: +SKIP
    <Enter an even number.>
    <Input box, Submit button>
    """
    # Input textbox
    textbox = widgets.Text(placeholder='Write your answer here')
    # Submit button
    submit_button = widgets.Button(description='Submit')
    # Space right of the submit button to show checkmark/x-mark
    visual_correct = widgets.HTML()
    # Space below input line to display error if function call errored
    error_space = widgets.HTML()
    # Space below input line to display explanation if answer is correct
    explain_space = widgets.HTML()

    # correctness function linked to the submit button
    def check_answer(_):
        response = textbox.value
        if isinstance(answers, collections.Callable):
            try:
                error_space.value = ''
                correct = answers(response)
            except Exception as e:
                correct = False
                error_space.value = 'Error in checking answer: {}'.format(e)
        elif isinstance(answers, str):
            correct = response == answers
        elif isinstance(answers, collections.Iterable):
            correct = response in answers
        else:
            raise TypeError('The `answers` arg is an incorrect type.')

        visual_correct.value = CHECK_ICON if correct else X_ICON
        if correct and explanation:
            explain_space.value = explanation

    submit_button.on_click(check_answer)
    question_tag = widgets.HTML(TEXT_STYLE.format(question))
    user_input_line = widgets.HBox([textbox, submit_button, visual_correct])
    display(
        widgets.VBox([
            question_tag, user_input_line, error_space, explain_space
        ])
    )
