const oracledb = require('oracledb');

// Oracle DB connection details
const dbConfig = {
    user: 'system',          // Oracle username
    password: '123456789',  // Oracle password
    connectString: 'localhost:1521/xe',  // Oracle connection string (adjust as needed)
};

// Function to get attendance data from the Oracle database
async function getAttendanceData(employeeID, date, detail) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Convert the date input to the correct Oracle date format
        const formattedDate = `TO_DATE('${date}', 'DD-MON-YY')`;

        const query = `
            SELECT ${detail.toUpperCase()}
            FROM attendance
            WHERE employee_id = :employeeID
            AND attendance_date = ${formattedDate}
        `;
        
        // Execute the query
        const result = await connection.execute(query, [employeeID]);

        // If data exists, return the result, else return null
        if (result.rows.length > 0) {
            return result.rows[0][0]; // Assuming we only fetch one column (the requested detail)
        } else {
            return null;
        }

    } catch (err) {
        console.error("Database query error:", err);
        return null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// Export the function to be used in the bot
module.exports = { getAttendanceData };
