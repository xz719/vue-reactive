import Observer from "./Observer";
import { isObject } from "./utils";

export default function observe(value) {
  if (!isObject(value)) {
    return;
  }
  var ob;
  if (value.__ob__ && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}
