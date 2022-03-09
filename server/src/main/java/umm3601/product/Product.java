package umm3601.product;

import org.mongojack.Id;
import org.mongojack.ObjectId;
import java.util.ArrayList;

@SuppressWarnings({"VisibilityModifier"})
public class Product {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;
  public String product_name;
  public ArrayList<String> tags;
  public int threshold;
  public String description;
  public String brand;
  public String category;
  public String store;
  public String location;
  public String notes;
  public String lifespan;
  public String image;
  public String name;
}
