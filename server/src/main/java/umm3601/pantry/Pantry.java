package umm3601.pantry;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Pantry {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  //Some Mongo Foreign key to product

  public String notes;
  public String purchaseDate;
  public String[] tags;
}
