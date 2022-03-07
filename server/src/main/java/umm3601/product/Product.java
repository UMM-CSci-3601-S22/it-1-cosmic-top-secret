package umm3601.product;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Product {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String name;
  public String[] tags;
  public int threshold;
}
