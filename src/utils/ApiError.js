class ApiError extends Error{
    //google nodejs api error there  u will get api error class
   //making my own constructor
    constructor( 
        statusCode,
            message = "Something went wrong",
            errors = [],
            stack=""
      )  {
    
        //overwriting constructor with default values
        super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false;
        this.errors = errors
        
        if (stack) {
            this.stack=stack
        } else {
            Error.captureStackTrace(this,this.constuctor)
        }
    }
}
export {ApiError}