package quandlquery;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.Iterator;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;

/**
 *
 * @author Jordan Bodker
 */
public class QuandlQuery {
/**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException, IOException, InterruptedException, ParseException {
        QuandlQuery obj = new QuandlQuery();
        obj.run();
    }
    
    public void run() throws FileNotFoundException, IOException, InterruptedException, ParseException {
        
        String csvFile = "stockinfo.csv";
	BufferedReader br = null;
	String line = "";
	String cvsSplitBy = ",";
        
        //delete allticker.json if existing
        File at = new File("alltickers.json");
        if(at.exists()) {
            delete(at);
        }
        
        //delete tickers directory if exist
        File dir = new File("tickers");
        if(dir.exists()) {            
            delete(dir);
        }
        
        //now create it
        dir.mkdir();
        
        
        br = new BufferedReader(new FileReader(csvFile));
        br.readLine();
        
        boolean first = true;
        
        while((line = br.readLine()) != null) {
                
            JSONObject company = new JSONObject();               
                              
            String[] code = line.split(cvsSplitBy);
            
            String tickerKey = code[0];
            tickerKey = tickerKey.replace('.', '_');
            tickerKey = tickerKey.replace('/', '_');
            
            String ticker = code[0];
            company.put("ticker", ticker);
            
            String stockName = code[1];
            company.put("name", stockName);
            
            String priceCode;
            if(code[2].contains("/")) {
                priceCode = code[2];
            }
            else {
                priceCode = null;
            }
            company.put("price code", priceCode);
            
            String exchange;
            if(code[2].contains("/")) {
                String[] parts = code[2].split("/");
                exchange = parts[1];
                parts = exchange.split("_");
                exchange = parts[0];
            }
            else {
                exchange = null;
            }
            company.put("exchange", exchange);
            
            //Start downloading a ticker file
            
            try {
                
                File f = new File("tickers/" + tickerKey + ".json");
                System.out.println("Downloading ticker: " + ticker);
                String url = "http://www.quandl.com/api/v1/datasets/DMDRN/" + tickerKey + "_ALLFINANCIALRATIOS.json?auth_token=iT1LrBo1Uw79uqJfrKyb";
                URL website = new URL(url);
                ReadableByteChannel rbc = Channels.newChannel(website.openStream());
                FileOutputStream fos = new FileOutputStream("tickers/" + tickerKey + ".json");
                fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);                
                    
            } catch(FileNotFoundException e) {
                System.err.println("Error downloading ticker " + ticker);
            }
            
            Thread.sleep(100);
            
            if(first) {
                createJSON(tickerKey);
                first = false;
            }
            
            addToJSON(company, tickerKey);
            
        }
        
        File tickerDir = new File("tickers");
        if(tickerDir.exists()) {
            delete(tickerDir);
        }
        
    }
    
    public void createJSON(String tickerKey) throws FileNotFoundException, IOException, ParseException {
        
        JSONObject jsonObject = new JSONObject();
        JSONParser jsonParser = new JSONParser();
        
        Object obj = jsonParser.parse(new FileReader("tickers/" + tickerKey + ".json"));            
        JSONObject object = (JSONObject) obj;          
        jsonObject.put("column_names", object.get("column_names"));
        
        FileWriter file = new FileWriter("alltickers.json");
        file.write(jsonObject.toJSONString());
        file.flush();
        file.close();   
        
    }
    
    public void addToJSON(JSONObject company, String tickerKey) throws FileNotFoundException, IOException, ParseException {
        
        JSONParser parser = new JSONParser();
        
        Object obj1 = parser.parse(new FileReader("alltickers.json"));
        JSONObject mainObject = (JSONObject) obj1;
        Object obj2 = parser.parse(new FileReader("tickers/" + tickerKey + ".json"));
        JSONObject jsonObject = (JSONObject) obj2;
        
        JSONArray mainColumns = (JSONArray) mainObject.get("column_names");
        JSONArray columns = (JSONArray) jsonObject.get("column_names");
        JSONArray data = (JSONArray) jsonObject.get("data");
        
        if(data.size() == 0) {
            for(int i = 0; i < mainColumns.size(); i++) {
                data.add(i, null);
            }
        }
        
        else {
            Iterator<JSONArray> iterator = data.iterator();
            data = iterator.next();        

            int x = 0;

            for(int i = 0; i < mainColumns.size(); i++) {
                if(x < columns.size()) {
                    if(columns.get(x).equals(mainColumns.get(i))) {
                        x++;
                    }
                    else {
                        data.add(i, null);
                    }                            
                }
                else {
                    data.add(i, null);
                }
            }
        }
        
        company.put("data", data);
        System.out.println(company);
        mainObject.put(tickerKey, company);
        
        FileWriter file = new FileWriter("alltickers.json");
        file.write(mainObject.toJSONString());
        file.flush();
        file.close();
        
    }
    
    /**
     * retrieved from: http://www.mkyong.com/java/how-to-delete-directory-in-java/
     * @param file
     * @throws IOException 
     */
    public static void delete(File file) throws IOException{
 
    	if(file.isDirectory()){
 
            //directory is empty, then delete it
            if(file.list().length==0){

               file.delete();

            }
            else {

               //list all the directory contents
               String files[] = file.list();

               for (String temp : files) {
                  //construct the file structure
                  File fileDelete = new File(file, temp);

                  //recursive delete
                 delete(fileDelete);
               }

               //check the directory again, if empty then delete it
               if(file.list().length==0){
                 file.delete();
               }
            }
 
    	}
        else {
            //if file, then delete it
            file.delete();
    	}
    }    
}
