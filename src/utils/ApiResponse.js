class ApiResponse{
    constructor(
        statusCode,
        data,
        messgae = "SUccess"
    ) {
        this.statusCode = statusCode
        this.data = data
        this.messgae = messgae
        this.success = statusCode < 400
        
    }
}