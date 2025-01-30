class errorHandler extends Error{
    constructor(public message:string, public statusCode: number){
        super(message);
        // adding new property in this class about statusCode
        this.statusCode = statusCode;

    }
}
export default errorHandler