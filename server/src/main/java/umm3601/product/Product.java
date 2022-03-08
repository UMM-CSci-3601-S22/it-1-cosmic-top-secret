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
}
