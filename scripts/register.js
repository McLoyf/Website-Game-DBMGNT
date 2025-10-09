import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(hash);
};

hashPassword("test123");

const plainPassword = 'test123';
const hashedPassword = "$2b$10$7LexljOCl8JWCMN52kApKuExakuQs8lTtYcti3K2El8vraMqvQErG";

bcrypt.compare(plainPassword, hashedPassword, function(err,result){
    if(err){
        console.error(err);
        return;
    }
    if(result){
        console.log("Password is correct!");
    }else {
        console.log("What the fuck are you doing?!");
    }
});
