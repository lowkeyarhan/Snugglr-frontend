import AllowedDomain from "../../models/admin/AllowedCollege";

// get all allowed domains (admin only)
export const getAllDomains = async (req, res) => {
  const { isActive } = req.query;

  // build the filter
  const filter: any = {};
  if (isActive !== undefined) filter.isActive = isActive === "true";

  // get all allowed domains
  const domains = await AllowedDomain.find(filter).sort({ institutionName: 1 });

  // return the allowed domains
  res.json({ success: true, data: domains });
};

// add a new allowed domain (admin only)
export const addDomain = async (req, res) => {
  const { domain, institutionName, isActive = true } = req.body;

  // check if domain and institution name are provided
  if (!domain || !institutionName) {
    return res.status(400).json({ message: "Domain & institution required" });
  }

  // check if domain already exists
  const exists = await AllowedDomain.findOne({ domain: domain.toLowerCase() });
  if (exists) {
    return res.status(400).json({ message: "Domain already exists" });
  }

  // create a new allowed domain
  const newDomain = await AllowedDomain.create({
    domain: domain.toLowerCase(),
    institutionName,
    isActive,
  });

  // return the new allowed domain
  res.status(201).json({ success: true, data: newDomain });
};

// update an allowed domain (admin only)
export const updateDomain = async (req, res) => {
  const { id } = req.params;
  const { domain, institutionName, isActive } = req.body;

  // check if domain and institution name are provided
  if (!domain || !institutionName) {
    return res.status(400).json({ message: "Domain & institution required" });
  }

  // update the allowed domain
  const updated = await AllowedDomain.findByIdAndUpdate(
    id,
    { domain, institutionName, isActive },
    { new: true, runValidators: true }
  );

  // check if the domain was updated
  if (!updated) {
    return res.status(404).json({ message: "Domain not found" });
  }

  // return the updated domain
  res.json({ success: true, data: updated });
};

// delete an allowed domain (admin only)
export const deleteDomain = async (req, res) => {
  const { id } = req.params;
  const deleted = await AllowedDomain.findByIdAndDelete(id);

  // check if the domain was deleted
  if (!deleted) {
    return res.status(404).json({ message: "Domain not found" });
  }

  // return the success message
  res.json({ success: true, message: "Domain deleted" });
};
