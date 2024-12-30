const zod = require("zod");

function validateInput(array){
    const schema = zod.array(
        zod.object({
            userfirstname: zod.string().min(1, { message: "You should be name more then 1 charecter" }),
            userlastname: zod.string().min(1,{ massage: "Your last name should be greatter then 1 character" }),
            gmailId: zod.string().email({ message: "Invalid email format" }),
            password: zod.string().min(6, { message: "Password must be at least 6 characters long" }),
        })
    );
    const response = schema.safeParse(array);
}

