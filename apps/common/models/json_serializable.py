from datetime import datetime
from decimal import Decimal
import json


class CustomJsonEncoder(json.JSONEncoder):
	def default(self, obj):
		"""
		default method is used if there is an unexpected object type
		in our example obj argument will be Decimal('120.50') and datetime
		in this encoder we are converting all Decimal to float and datetime to str
		"""
		if isinstance(obj, datetime):
			obj = str(obj)
		elif isinstance(obj, Decimal):
			obj = float(obj)
		else:
			obj = super(CustomJsonEncoder, self).default(obj)

		return obj


class JsonSerializableClass:
	def __init__(self):
		pass

	def to_json(self):
		return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4, cls=CustomJsonEncoder)
