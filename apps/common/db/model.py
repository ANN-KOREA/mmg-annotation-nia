import decimal

class DBObject(object):

    def __new__(cls, *args, **kwargs):
        if args[0]:
            return object.__new__(cls, *args, **kwargs)

        else:
            return None

    def __init__(self, row_proxy=None):
        if row_proxy:
            for key in row_proxy.keys():
                if isinstance(row_proxy[key], decimal.Decimal) and not float(row_proxy[key]).is_integer():
                    setattr(self, key, float(row_proxy[key]))
                elif isinstance(row_proxy[key], decimal.Decimal) and float(row_proxy[key]).is_integer():
                    setattr(self, key, int(row_proxy[key]))
                else:
                    setattr(self, key, row_proxy[key])

    def __getattr__(self, name):
        raise AttributeError(name)
