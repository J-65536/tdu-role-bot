import { Components, Select } from 'discord-hono';
import { FACULTIES } from '../constants';

export const getDeptComponents = () => {
  const components = new Components();

  FACULTIES.forEach((faculty) => {
    const select = new Select(`select_dept_${faculty.id}`, 'String')
      .placeholder(faculty.name)
      .min_values(1)
      .max_values(1)
      .options(
        ...faculty.departments.map((dept) => ({
          label: dept.label,
          value: dept.value,
        }))
      );

    components.row(select);
  });

  return components;
};