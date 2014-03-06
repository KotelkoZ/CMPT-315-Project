package quandlquery;

import java.io.BufferedReader;
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
    public static void main(String[] args) throws FileNotFoundException, IOException, ParseException {
        QuandlQuery obj = new QuandlQuery();
        obj.run();        
    }
    
    public void run() throws FileNotFoundException, IOException, ParseException {
        
        
        String csvFile = "stockinfo.csv";
	BufferedReader br = null;
	String line = "";
	String cvsSplitBy = ",";
        
        br = new BufferedReader(new FileReader(csvFile));
        int i = 0;
        while ((line = br.readLine()) != null) {
            
            String[] code = line.split(cvsSplitBy);
            
            
            String[] parts = code[1].split("_");
            String ticker = parts[1];
            System.out.println(ticker);
            
            if(i < 10) {
                
                try {
                    String url = "http://www.quandl.com/api/v1/datasets/OFDP/DMDRN_" + ticker + "_ALLFINANCIALRATIOS.json?auth_token=iT1LrBo1Uw79uqJfrKyb";
                    URL website = new URL(url);
                    ReadableByteChannel rbc = Channels.newChannel(website.openStream());
                    FileOutputStream fos = new FileOutputStream("tickers/" + ticker + ".json");
                    fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
                } catch(FileNotFoundException e) {
                    System.out.println("^There was an exception! The url doesn't exist");
                }
                
                if(i == 0) {
                    createJSON(ticker);
                }
                
                readJSON(ticker);
                
            }
            i++;
        }
        
        
        
    }
    
    public void readJSON(String ticker) throws IOException, ParseException {
        
        JSONParser parser = new JSONParser();
        
        try {
            
            Object obj = parser.parse(new FileReader("tickers/" + ticker + ".json"));
            
            JSONObject jsonObject = (JSONObject) obj;
            
            String name = (String) jsonObject.get("name");
                        
            String[] parts = name.split("\\(");
            name = parts[0];
            name = name.substring(0, name.length() - 1);
            
            JSONArray data = (JSONArray) jsonObject.get("data");
            Iterator<JSONArray> iterator = data.iterator();
            data = iterator.next();
            
            JSONArray company = new JSONArray();
            company.add(ticker);
            company.add(name);
            company.add(data);
            
            addToJSON(company, ticker);
            
        } catch(FileNotFoundException e) {
                    System.out.println("^There was an exception! The url doesn't exist");
                }
        
    }
    
    public void createJSON(String ticker) throws FileNotFoundException, IOException, ParseException {
        
        JSONObject json = new JSONObject();
        JSONParser parser = new JSONParser();
        
        try {
            
            Object obj = parser.parse(new FileReader("tickers/" + ticker + ".json"));
            
            JSONObject jsonObject = (JSONObject) obj;

            JSONArray columns = (JSONArray) jsonObject.get("column_names");
            
            json.put("column_names", columns);
            
        } catch(FileNotFoundException e) {
                    System.out.println("^There was an exception! The url doesn't exist");
                }
        
        try {
            
            FileWriter file = new FileWriter("alltickers.json");
            file.write(json.toJSONString());
            file.flush();
            file.close();
            
        } catch(IOException e) {
            e.printStackTrace();
        }
        
    }
    
    public void addToJSON(JSONArray company, String ticker) throws IOException, ParseException {
        
        JSONObject json = new JSONObject();
        JSONParser parser = new JSONParser();
        
        try {
            
            Object obj = parser.parse(new FileReader("alltickers.json"));
            
            json = (JSONObject) obj;
            
            json.put(ticker, company);
            
        } catch(FileNotFoundException e) {
                    System.out.println("^There was an exception! The url doesn't exist");
                }
        
        try {
            
            FileWriter file = new FileWriter("alltickers.json");
            file.write(json.toJSONString());
            file.flush();
            file.close();
        } catch(IOException e) {
            e.printStackTrace();
        }
        
    }
    
}
