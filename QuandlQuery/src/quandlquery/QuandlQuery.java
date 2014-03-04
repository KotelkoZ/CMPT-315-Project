/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package quandlquery;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;

/**
 *
 * @author Jordan Bodker
 */
public class QuandlQuery {

    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) throws FileNotFoundException, IOException {
        QuandlQuery obj = new QuandlQuery();
        obj.run();
    }
    
    public void run() throws FileNotFoundException, IOException {
        
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
            }
            i++;
        }
        
        
        
    }
}
