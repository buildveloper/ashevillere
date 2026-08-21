/**
 * Data source registry — every dataset the site cites, with the citation
 * fields required by the honesty contract: source name, organization,
 * last-updated status, role, and official link. Shown on the methodology
 * page and cited per-panel in the lookup.
 */

export interface DataSource {
  name: string;
  org: string;
  url: string;
  /** Last-updated indicator shown in citations (never a fake date). */
  updated: string;
  role: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    name: "U.S. Census Bureau Geocoder",
    org: "U.S. Census Bureau",
    url: "https://geocoding.geo.census.gov",
    updated: "Continuously updated",
    role: "Converts an address to coordinates and scopes lookups to Buncombe County (FIPS 37021) via ZIP-code classification.",
  },
  {
    name: "FEMA National Flood Hazard Layer",
    org: "Federal Emergency Management Agency",
    url: "https://www.fema.gov/flood-maps/national-flood-hazard-layer",
    updated: "Current effective FIRMs",
    role: "Flood zone determination for a point (NFHL MapServer). Zone codes (AE, AO, X, …) map to flood risk and federal insurance requirements.",
  },
  {
    name: "NC Flood Risk Information System (FRIS)",
    org: "State of North Carolina",
    url: "https://fris.nc.gov",
    updated: "State-maintained",
    role: "State floodplain mapping cross-reference for the flood panel — often more current or granular than the federal layer alone.",
  },
  {
    name: "Buncombe County GIS",
    org: "Buncombe County, NC",
    url: "https://gis.buncombecounty.org",
    updated: "County-maintained",
    role: "Zoning districts, parcels, effective DFIRM/FRIS flood layers, and Accela address/damage records. STR eligibility depends on whether a property is inside Asheville city limits (2018 ordinance) or county jurisdiction.",
  },
  {
    name: "Buncombe County open data — Helene damage parcels",
    org: "Buncombe County, NC",
    url: "https://data.buncombenc.gov/",
    updated: "County-maintained",
    role: "County-published per-parcel records of reported Hurricane Helene damage (Accela table). The tool checks whether a parcel appears in this dataset; it also notes when post-Helene county aerial imagery is available. It is not an official damage determination.",
  },
  {
    name: "NC Department of Public Safety",
    org: "State of North Carolina",
    url: "https://www.ncdps.gov",
    updated: "Ongoing",
    role: "Hurricane Helene response and recovery programs affecting Buncombe County.",
  },
];