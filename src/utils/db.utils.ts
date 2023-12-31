export default class DBUtils {
    public getIdTable = async (username:string): Promise<String> => {
        
        const id = Array.from(username)[0];
        const table1 = ['a', 'b', 'c', 'd']
        const table2 = ['e', 'f', 'g', 'h', 'i']
        const table3 = ['j', 'k', 'l', 'm', 'n']
        const table4 = ['o', 'p', 'q', 'r', 's']
        const table5 = ['t', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

        if (table1.includes(id)) {
            return 'idtable1'
        } else if (table2.includes(id)) {
            return 'idtable2'
        } else if (table3.includes(id)) {
            return 'idtable3'
        } else if (table4.includes(id)) {
            return 'idtable4'
        } else {
            return 'idtable5'
        }
        
    }
}