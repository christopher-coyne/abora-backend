// sample handler

/*
const signUpHandler = async (req, res) => {
    const { name, email } = req.body;

    if (!isValidName(name)) {
        return res.status(httpStatus.BAD_REQUEST).send();
    }

    if (!isValidEmail(email)) {
        return res.status(httpStatus.BAD_REQUEST).send();
    }

    try {
        const user = userService.register(name, email);
        return res.status(httpStatus.CREATED).send(user)
    } catch(err) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .send()
    }
}
*/
