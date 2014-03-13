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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.NoSuchElementException;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;

/**
 *
 * @author Jordan Bodker
 */
public class QuandlQuery {

    ArrayList dataList = new ArrayList();
    
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException, IOException, ParseException, InterruptedException {
        QuandlQuery obj = new QuandlQuery();
        obj.run();        
    }
    
    public void run() throws FileNotFoundException, IOException, ParseException, InterruptedException {
        
        
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
            String tickerCode;
            if(parts.length == 3) {
                tickerCode = parts[1] + "_" + parts[2];
            }
            else {
                tickerCode = parts[1];
            }
            
            String exchange = code[4];
            System.out.println(ticker);
            System.out.println(exchange);
            
            if(i <= 10) {                
                
                try {
                    File f = new File("tickers/" + tickerCode + ".json");
                    if(!f.exists()) {
                        System.out.println("Downloading ticker: " + ticker);
                        String url = "http://www.quandl.com/api/v1/datasets/OFDP/DMDRN_" + tickerCode + "_ALLFINANCIALRATIOS.json?auth_token=iT1LrBo1Uw79uqJfrKyb";
                        URL website = new URL(url);
                        ReadableByteChannel rbc = Channels.newChannel(website.openStream());
                        FileOutputStream fos = new FileOutputStream("tickers/" + tickerCode + ".json");
                        fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
                    }
                    
                } catch(FileNotFoundException e) {
                    System.err.println("Error downloading ticker " + ticker);
                }
                
                if(i == 0) {
                    createJSON(ticker);
                }
                
                Thread.sleep(10);
                readJSON(tickerCode, ticker, exchange);
                
            }
            i++;
        }
        
        
        
    }
    
    public void readJSON(String tickerCode, String ticker, String exchange) throws IOException, ParseException {
        
        JSONParser parser = new JSONParser();
        
        try {
            
            Object obj = parser.parse(new FileReader("tickers/" + tickerCode + ".json"));
            
            JSONObject jsonObject = (JSONObject) obj;
            
            String name = (String) jsonObject.get("name");
                        
            String[] parts = name.split("\\(");
            name = parts[0];
            name = name.substring(0, name.length() - 1);
            
            JSONArray columns = (JSONArray) jsonObject.get("column_names");
            JSONArray data = (JSONArray) jsonObject.get("data");
            
            Iterator<JSONArray> iterator = data.iterator();
            try {
                data = iterator.next();
                
                int x = 0;
                
                    for(int i = 0; i < dataList.size(); i++) {
                        if(x < columns.size()) {
                            if(columns.get(x).equals(dataList.get(i))) {
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
                
                JSONObject company = new JSONObject();
                
                
                company.put("ticker", ticker);
                company.put("name", name);
                company.put("exchange", exchange);
                company.put("data", data);
            
                addToJSON(company, ticker);
            } catch (NoSuchElementException e) {
                System.err.println("Error on ticker " + ticker);
            }
            
            //JSONArray company = new JSONArray();
            //company.add(ticker);
            //company.add(name);
            //company.add(data);
            
            //addToJSON(company, ticker);
            
        } catch(FileNotFoundException e) {
                    System.err.println("^Can't access that ticker file");
                }
        
    }
    
    public void createJSON(String tickerCode) throws FileNotFoundException, IOException, ParseException {
        
        JSONObject json = new JSONObject();
        JSONParser parser = new JSONParser();
        
        try {
            
            Object obj = parser.parse(new FileReader("tickers/" + tickerCode + ".json"));
            
            JSONObject jsonObject = (JSONObject) obj;

            dataList = (JSONArray) jsonObject.get("column_names");
            
            json.put("column_names", dataList);
            
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
    
    public void addToJSON(JSONObject company, String ticker) throws IOException, ParseException {
        
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
