# Ignore warnings from bqplot. We won't use FutureWarnings ourselves so this
# should be okay.
import warnings
warnings.simplefilter(action="ignore", category=FutureWarning)

# Ignore numpy dtype warnings. These warnings are caused by an interaction
# between numpy and Cython and can be safely ignored.
# Reference: https://stackoverflow.com/a/40846742
warnings.filterwarnings("ignore", message="numpy.dtype size changed")
warnings.filterwarnings("ignore", message="numpy.ufunc size changed")

from .exporters import *
from .plotting import *
from .questions import *
from . import util
