from nbconvert.preprocessors.execute import executenb
import nbformat
import logging

logging.basicConfig(level=logging.DEBUG)

with open('Test.ipynb', encoding='utf-8') as f:
    nb = nbformat.read(f, 4)

executed = executenb(nb)

with open('Test_Executed.ipynb', 'w', encoding='utf-8') as f:
    nbformat.write(executed, f)
