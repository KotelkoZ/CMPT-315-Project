/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package quandlquery2;

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
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 *
 * @author Jordan Bodker
 */
public class QuandlQuery2 {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException, IOException, InterruptedException, ParseException {
        QuandlQuery2 obj = new QuandlQuery2();
        obj.run();
    }
    
    public void run() throws FileNotFoundException, IOException, InterruptedException, ParseException {
        
        String csvFile = "stockinfo.csv";
	BufferedReader br = null;
	String line = "";
	String cvsSplitBy = ",";
        
        //create tickers directory
        File dir = new File("tickers");
        if (!dir.exists()) {
            dir.mkdir();
        }
        
        br = new BufferedReader(new FileReader(csvFile));
        br.readLine();
        
        int i = 0;
        
        while((line = br.readLine()) != null) {
            
            String[] code = line.split(cvsSplitBy);
            
            String tickerKey = code[0];
            tickerKey = tickerKey.replace('.', '_');
            System.out.println(tickerKey);
            
            String ticker = code[0];
            System.out.println(ticker);
            
            String stockName = code[1];
            System.out.println(stockName);
            
            if(code[2].contains("/")) {
                String priceCode = code[2];
                System.out.println(priceCode);
            }
            else {
                String priceCode = null;
                System.out.println(priceCode);
            }            
            
            if(code[2].contains("/")) {
                String[] parts = code[2].split("/");
                String exchange = parts[1];
                parts = exchange.split("_");
                exchange = parts[0];
                System.out.println(exchange);
            }
            else {
                String exchange = null;
                System.out.println(exchange);
            }
            
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
            
            if(i == 0) {
                createJSON(tickerKey);
            }
            
            i++;
            
        }
        
    }
    
    public void createJSON(String tickerKey) throws FileNotFoundException, IOException, ParseException {
        
        JSONObject jsonObject = new JSONObject();
        JSONParser jsonParser = new JSONParser();
        
        try {
            
            Object obj = jsonParser.parse(new FileReader("tickers/" + tickerKey + ".json"));            
            JSONObject object = (JSONObject) obj;          
            jsonObject.put("column_names", object.get("column_names"));
            
        } catch(FileNotFoundException e) {
            System.out.println("^There was an exception! The url doesn't exist");
        }
        
        try {
            
            FileWriter file = new FileWriter("alltickers.json");
            file.write(jsonObject.toJSONString());
            file.flush();
            file.close();
            
        } catch(IOException e) {
            e.printStackTrace();
        }
        
        
        
    }
    
}
