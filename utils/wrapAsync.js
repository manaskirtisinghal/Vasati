module.exports = (fn)=>{
    return (req,res,next) => {
        fn(req,res,next).catch(next);
    }
}


//In order to reduce this
// app.get("/items", async (req, res, next) => {
//   try {
//     const items = await Item.find();
//     res.send(items);
//   } catch (err) {
//     next(err); // forwards the error to your app.use((err, ...) => ...)
//   }
// });