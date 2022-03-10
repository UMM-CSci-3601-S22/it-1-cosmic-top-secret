package umm3601.pantry;

import org.mongojack.Id;
import org.mongojack.ObjectId;
import java.util.ArrayList;

@SuppressWarnings({"VisibilityModifier"})
public class Pantry {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  //Some Mongo Foreign key to product
  public String productId;
  public String purchaseDate;
  public ArrayList<String> tags;
  public String notes;
}
