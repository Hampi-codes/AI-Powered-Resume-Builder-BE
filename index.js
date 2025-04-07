import express from "express";

let app = express();
let port =3003
app.use()
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
app.get('/', (req, res)=>{
    console.log("::::::::::::::::::::::::::::::::::::::")
    res.send('Hello World!');
})