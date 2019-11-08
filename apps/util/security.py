import hashlib

PASSWD_SALT = "annotation"


def encode_sha256(raw_string):
    salt = PASSWD_SALT

    return hashlib.sha256(raw_string + salt).hexdigest()


if __name__ == "__main__":
    print encode_sha256("demo")
